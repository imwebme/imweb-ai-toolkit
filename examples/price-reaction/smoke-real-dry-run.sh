#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LAB_DIR="${ROOT_DIR}/examples/price-reaction"

resolve_imweb_bin() {
  if [[ -n "${IMWEB_BIN:-}" ]]; then
    printf '%s\n' "${IMWEB_BIN}"
    return 0
  fi

  if command -v imweb >/dev/null 2>&1; then
    command -v imweb
    return 0
  fi

  return 1
}

if ! IMWEB_BIN_PATH="$(resolve_imweb_bin)"; then
  echo "실제 CLI smoke를 위해 실행 가능한 imweb 바이너리가 필요합니다. IMWEB_BIN을 지정하거나 PATH에서 imweb를 찾을 수 있어야 합니다." >&2
  exit 1
fi

if [[ ! -x "${IMWEB_BIN_PATH}" ]]; then
  echo "실제 CLI smoke를 위해 실행 가능한 imweb 바이너리가 필요합니다: ${IMWEB_BIN_PATH}" >&2
  exit 1
fi

TMP_HOME="$(mktemp -d)"
PLAN_ONLY_PATH="${TMP_HOME}/plan-only.json"
PLAN_PATH="${TMP_HOME}/plan.json"
trap 'rm -rf "${TMP_HOME}"' EXIT

HOME="${TMP_HOME}" "${IMWEB_BIN_PATH}" profile set smoke-price-lab \
  --site-code S_PRICE_LAB \
  --unit-code u-price-lab >/dev/null
HOME="${TMP_HOME}" "${IMWEB_BIN_PATH}" profile use smoke-price-lab >/dev/null

HOME="${TMP_HOME}" python3 "${LAB_DIR}/run.py" \
  --snapshot "${LAB_DIR}/fixtures/competitor-snapshot.json" \
  --policy "${LAB_DIR}/fixtures/policy.json" \
  --product-fixture "${LAB_DIR}/fixtures/products.json" \
  --imweb-bin "${IMWEB_BIN_PATH}" \
  --profile smoke-price-lab \
  --plan-out "${PLAN_ONLY_PATH}" >/dev/null

python3 - "${PLAN_ONLY_PATH}" <<'PY'
import json
import sys
from pathlib import Path

plan = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
assert plan["outputContract"] == "price-reaction.v1"
assert plan["mode"] == "plan_only"
assert plan["planSummary"] == {"total": 2, "updates": 1, "holds": 1, "skips": 0}
first, second = plan["actions"]
assert first["decision"]["action"] == "update"
assert first["command"]["reusable"] is True
assert first["command"]["target"] == {"prodNo": 2001, "unitCode": "u-price-lab"}
assert first["execution"] == {"attempted": False, "status": "not_run", "response": None}
assert second["decision"]["action"] == "hold"
assert second["command"]["reusable"] is False
assert second["command"]["args"] is None
assert second["execution"] == {"attempted": False, "status": "not_applicable", "response": None}
PY

HOME="${TMP_HOME}" python3 "${LAB_DIR}/run.py" \
  --snapshot "${LAB_DIR}/fixtures/competitor-snapshot.json" \
  --policy "${LAB_DIR}/fixtures/policy.json" \
  --product-fixture "${LAB_DIR}/fixtures/products.json" \
  --imweb-bin "${IMWEB_BIN_PATH}" \
  --profile smoke-price-lab \
  --execute-dry-run \
  --plan-out "${PLAN_PATH}" >/dev/null

python3 - "${PLAN_PATH}" <<'PY'
import json
import sys
from pathlib import Path

plan = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
assert plan["outputContract"] == "price-reaction.v1"
assert plan["mode"] == "dry_run"
assert plan["planSummary"] == {"total": 2, "updates": 1, "holds": 1, "skips": 0}
first, second = plan["actions"]
assert first["decision"]["action"] == "update"
assert first["command"]["reusable"] is True
assert first["command"]["target"] == {"prodNo": 2001, "unitCode": "u-price-lab"}
assert first["command"]["args"] == [
    "product",
    "update",
    "price",
    "2001",
    "--data",
    '{"price":18000,"unitCode":"u-price-lab"}',
    "--dry-run",
]
execution = first["execution"]
response = execution["response"]
assert execution["attempted"] is True
assert execution["status"] == "dry_run"
assert response["dry_run"] is True
assert response["path"] == "/products/2001/price"
assert response["request"]["body"]["price"] == 18000
assert response["request"]["body"]["unitCode"] == "u-price-lab"
assert second["decision"]["action"] == "hold"
assert second["command"]["reusable"] is False
assert second["execution"]["status"] == "not_applicable"
PY

printf 'real dry-run smoke ok\n'
