#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LAB_DIR="${ROOT_DIR}/examples/price-reaction"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

FAKE_IMWEB="${TMP_DIR}/fake-imweb"
LOG_PATH="${TMP_DIR}/fake-imweb.log"
PLAN_PATH="${TMP_DIR}/plan.json"
PLAN_ONLY_PATH="${TMP_DIR}/plan-only.json"
EXTENDED_PRODUCTS_PATH="${TMP_DIR}/products.json"
EXTENDED_SNAPSHOT_PATH="${TMP_DIR}/competitor-snapshot.json"
EXTENDED_POLICY_PATH="${TMP_DIR}/policy.json"
INVALID_POLICY_PATH="${TMP_DIR}/invalid-policy.json"
INCREASE_BOUNDARY_POLICY_PATH="${TMP_DIR}/increase-boundary-policy.json"

cat > "${FAKE_IMWEB}" <<'PY'
#!/usr/bin/env bash
set -euo pipefail

fixture_path="$1"
log_path="$2"
shift 2

printf '%s\n' "$*" >> "${log_path}"

if [[ "$1" == "--output" && "$2" == "json" && "$3" == "product" && "$4" == "update" && "$5" == "price" && "$6" == "2001" ]]; then
  body="$8"
  BODY="${body}" python3 - <<'INNER'
import json
import os

body = json.loads(os.environ["BODY"])
assert body["price"] == 18000
print(json.dumps({
    "dry_run": True,
    "path": "/products/2001/price",
    "request": {"body": body}
}, ensure_ascii=False))
INNER
  exit 0
fi

echo "{\"error\": \"$*\"}" >&2
exit 1
PY
chmod +x "${FAKE_IMWEB}"

python3 - "${LAB_DIR}" "${EXTENDED_PRODUCTS_PATH}" "${EXTENDED_SNAPSHOT_PATH}" "${EXTENDED_POLICY_PATH}" "${INVALID_POLICY_PATH}" "${INCREASE_BOUNDARY_POLICY_PATH}" <<'PY'
import json
import sys
from pathlib import Path

lab_dir = Path(sys.argv[1])
products_path = Path(sys.argv[2])
snapshot_path = Path(sys.argv[3])
policy_path = Path(sys.argv[4])
invalid_policy_path = Path(sys.argv[5])
increase_boundary_policy_path = Path(sys.argv[6])

products = json.loads((lab_dir / "fixtures/products.json").read_text(encoding="utf-8"))
products["products"].append(
    {
        "prodNo": 2003,
        "data": {
            "prodNo": 2003,
            "name": "감마 삭스",
            "price": 10000,
            "unitCode": "u-price-lab",
        },
    }
)
products["products"].append(
    {
        "prodNo": 2004,
        "data": {
            "prodNo": 2004,
            "name": "델타 머그",
            "price": 15000,
            "unitCode": "u-price-lab",
        },
    }
)
products_path.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

snapshot = json.loads((lab_dir / "fixtures/competitor-snapshot.json").read_text(encoding="utf-8"))
snapshot["items"].append({"competitorSku": "gamma-socks", "price": 10050})
snapshot_path.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

policy = json.loads((lab_dir / "fixtures/policy.json").read_text(encoding="utf-8"))
policy["products"].append(
    {
        "prodNo": 2003,
        "competitorSku": "gamma-socks",
        "cost": 7000,
        "floorPrice": 9500,
        "ceilingPrice": 12000,
        "minMarginRate": 0.1,
        "undercutAmount": 100,
        "raiseStepLimit": 300,
    }
)
policy["products"].append(
    {
        "prodNo": 2004,
        "competitorSku": "delta-mug",
        "cost": 9000,
        "floorPrice": 12000,
        "ceilingPrice": 18000,
        "minMarginRate": 0.1,
        "undercutAmount": 100,
        "raiseStepLimit": 400,
    }
)
policy_path.write_text(json.dumps(policy, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

mixed_invalid_policy = json.loads(json.dumps(policy))
mixed_invalid_policy["products"].append(
    {
        "prodNo": 2999,
        "competitorSku": "invalid-before-execution",
        "cost": 10000,
        "floorPrice": 13000,
        "ceilingPrice": 12000,
        "minMarginRate": 0.4,
        "undercutAmount": 100,
        "raiseStepLimit": 300,
    }
)
invalid_policy_path.write_text(
    json.dumps(mixed_invalid_policy, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

increase_boundary_policy = {
    "products": [dict(next(item for item in policy["products"] if item["prodNo"] == 2003))]
}
increase_boundary_policy["products"][0]["competitorSku"] = "gamma-socks"
increase_boundary_policy["products"][0]["ceilingPrice"] = 9800
increase_boundary_policy_path.write_text(
    json.dumps(increase_boundary_policy, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)
PY

python3 "${LAB_DIR}/run.py" \
  --snapshot "${EXTENDED_SNAPSHOT_PATH}" \
  --policy "${EXTENDED_POLICY_PATH}" \
  --product-fixture "${EXTENDED_PRODUCTS_PATH}" \
  --imweb-bin "${FAKE_IMWEB} ${EXTENDED_PRODUCTS_PATH} ${LOG_PATH}" \
  --plan-out "${PLAN_ONLY_PATH}"

python3 - "${PLAN_ONLY_PATH}" "${LOG_PATH}" <<'PY'
import json
import sys
from pathlib import Path

plan = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
log_path = Path(sys.argv[2])
logs = log_path.read_text(encoding="utf-8").splitlines() if log_path.exists() else []

assert plan["outputContract"] == "price-reaction.v1"
assert plan["mode"] == "plan_only"
assert plan["planSummary"] == {"total": 4, "updates": 1, "holds": 2, "skips": 1}
assert logs == []

first, second, third, fourth = plan["actions"]
assert first["decision"]["action"] == "update"
assert first["command"]["reusable"] is True
assert first["execution"] == {"attempted": False, "status": "not_run", "response": None}

assert second["decision"]["action"] == "hold"
assert second["command"]["reusable"] is False
assert second["command"]["args"] is None
assert second["execution"]["status"] == "not_applicable"

assert third["decision"]["action"] == "hold"
assert third["decision"]["trigger"] == "increase"
assert third["execution"]["status"] == "not_applicable"

assert fourth["prodNo"] == 2004
assert fourth["decision"]["action"] == "skip"
assert fourth["decision"]["reasons"] == ["snapshot_missing"]
assert fourth["sources"]["snapshot"] == {
    "kind": "missing",
    "competitorSku": "delta-mug",
    "capturedPrice": None,
}
assert fourth["command"] == {
    "reusable": False,
    "commandPath": "product update price",
    "args": None,
    "argv": None,
    "shell": None,
    "body": None,
    "bodyJson": None,
    "target": {"prodNo": 2004, "unitCode": "u-price-lab"},
}
assert fourth["execution"] == {"attempted": False, "status": "not_applicable", "response": None}
PY

python3 "${LAB_DIR}/run.py" \
  --snapshot "${EXTENDED_SNAPSHOT_PATH}" \
  --policy "${EXTENDED_POLICY_PATH}" \
  --product-fixture "${EXTENDED_PRODUCTS_PATH}" \
  --imweb-bin "${FAKE_IMWEB} ${EXTENDED_PRODUCTS_PATH} ${LOG_PATH}" \
  --execute-dry-run \
  --plan-out "${PLAN_PATH}"

python3 - "${PLAN_PATH}" "${LOG_PATH}" <<'PY'
import json
import sys
from pathlib import Path

plan = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
logs = Path(sys.argv[2]).read_text(encoding="utf-8").splitlines()

assert plan["outputContract"] == "price-reaction.v1"
assert plan["mode"] == "dry_run"
assert plan["planSummary"] == {"total": 4, "updates": 1, "holds": 2, "skips": 1}
first, second, third, fourth = plan["actions"]
assert first["prodNo"] == 2001
assert first["decision"]["action"] == "update"
assert first["decision"]["targetPrice"] == 18000
assert "competitor_cheaper" in first["decision"]["reasons"]
assert first["sources"]["product"]["kind"] == "fixture"
assert first["command"]["reusable"] is True
assert first["command"]["commandPath"] == "product update price"
assert first["command"]["args"] == [
    "product",
    "update",
    "price",
    "2001",
    "--data",
    '{"price":18000,"unitCode":"u-price-lab"}',
    "--dry-run",
]
assert first["command"]["body"] == {"price": 18000, "unitCode": "u-price-lab"}
assert first["execution"]["attempted"] is True
assert first["execution"]["status"] == "dry_run"

assert second["prodNo"] == 2002
assert second["decision"]["action"] == "hold"
assert second["decision"]["targetPrice"] == 33000
assert "guarded_by_ceiling" in second["decision"]["reasons"]
assert second["guardrails"]["appliedReasons"] == ["guarded_by_ceiling"]
assert second["command"]["reusable"] is False
assert second["execution"]["status"] == "not_applicable"

assert third["prodNo"] == 2003
assert third["decision"]["action"] == "hold"
assert third["decision"]["trigger"] == "increase"
assert third["decision"]["currentPrice"] == 10000
assert third["decision"]["competitorPrice"] == 10050
assert third["decision"]["targetPrice"] == 10000
assert "competitor_higher" in third["decision"]["reasons"]
assert third["command"]["args"] is None
assert third["execution"]["status"] == "not_applicable"

assert fourth["prodNo"] == 2004
assert fourth["decision"]["action"] == "skip"
assert fourth["sources"]["snapshot"]["kind"] == "missing"
assert fourth["command"]["reusable"] is False
assert fourth["execution"]["status"] == "not_applicable"

assert any("--output json product update price 2001" in entry for entry in logs)
PY

INVALID_STDERR_PATH="${TMP_DIR}/invalid.stderr"
rm -f "${LOG_PATH}"
if python3 "${LAB_DIR}/run.py" \
  --snapshot "${EXTENDED_SNAPSHOT_PATH}" \
  --policy "${INVALID_POLICY_PATH}" \
  --product-fixture "${EXTENDED_PRODUCTS_PATH}" \
  --imweb-bin "${FAKE_IMWEB} ${EXTENDED_PRODUCTS_PATH} ${LOG_PATH}" \
  --execute-dry-run \
  > /dev/null 2> "${INVALID_STDERR_PATH}"; then
  echo "모순 정책이 실패하지 않았습니다." >&2
  exit 1
fi

python3 - "${INVALID_STDERR_PATH}" "${LOG_PATH}" <<'PY'
import sys
from pathlib import Path

stderr = Path(sys.argv[1]).read_text(encoding="utf-8")
assert "safeFloorPrice(14000) > ceilingPrice(12000)" in stderr
assert "prodNo=2999" in stderr

log_path = Path(sys.argv[2])
assert not log_path.exists() or not log_path.read_text(encoding="utf-8").strip()
PY

INCREASE_STDERR_PATH="${TMP_DIR}/increase-boundary.stderr"
if python3 "${LAB_DIR}/run.py" \
  --snapshot "${EXTENDED_SNAPSHOT_PATH}" \
  --policy "${INCREASE_BOUNDARY_POLICY_PATH}" \
  --product-fixture "${EXTENDED_PRODUCTS_PATH}" \
  > /dev/null 2> "${INCREASE_STDERR_PATH}"; then
  echo "increase ceiling 경계가 실패하지 않았습니다." >&2
  exit 1
fi

python3 - "${INCREASE_STDERR_PATH}" <<'PY'
import sys
from pathlib import Path

stderr = Path(sys.argv[1]).read_text(encoding="utf-8")
assert "increase 경로가 현재가 아래로 내려갑니다" in stderr
assert "currentPrice(10000) > ceilingPrice(9800)" in stderr
assert "prodNo=2003" in stderr
PY

printf 'fixture smoke ok\n'
