#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import os
import shlex
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass
class ProductPolicy:
    prod_no: int
    competitor_sku: str
    cost: int
    floor_price: int
    ceiling_price: int
    min_margin_rate: float
    undercut_amount: int
    raise_step_limit: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="경쟁사 스냅샷과 상품 정책을 읽어 imweb 가격 대응 dry-run 계획을 만듭니다."
    )
    parser.add_argument("--snapshot", required=True, help="경쟁사 가격 snapshot JSON 경로")
    parser.add_argument("--policy", required=True, help="상품 정책 JSON 경로")
    parser.add_argument("--product-fixture", help="product get 응답 대신 사용할 상품 fixture JSON 경로")
    parser.add_argument("--imweb-bin", default=os.environ.get("IMWEB_BIN", "imweb"))
    parser.add_argument("--profile", default=os.environ.get("IMWEB_PROFILE"))
    parser.add_argument("--execute-dry-run", action="store_true")
    parser.add_argument("--plan-out", help="생성한 plan JSON을 저장할 경로")
    return parser.parse_args()


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def coerce_int(value: Any, field_name: str) -> int:
    if isinstance(value, bool):
        raise ValueError(f"{field_name} 값이 잘못되었습니다.")
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str) and value.strip():
        return int(float(value))
    raise ValueError(f"{field_name} 값이 비어 있습니다.")


def load_policy(path: str) -> list[ProductPolicy]:
    raw = load_json(path)
    products = raw.get("products")
    if not isinstance(products, list) or not products:
        raise ValueError("policy.products는 비어 있지 않은 배열이어야 합니다.")

    result: list[ProductPolicy] = []
    for item in products:
        result.append(
            ProductPolicy(
                prod_no=coerce_int(item.get("prodNo"), "prodNo"),
                competitor_sku=str(item.get("competitorSku")),
                cost=coerce_int(item.get("cost"), "cost"),
                floor_price=coerce_int(item.get("floorPrice"), "floorPrice"),
                ceiling_price=coerce_int(item.get("ceilingPrice"), "ceilingPrice"),
                min_margin_rate=float(item.get("minMarginRate", 0)),
                undercut_amount=coerce_int(item.get("undercutAmount", 0), "undercutAmount"),
                raise_step_limit=coerce_int(item.get("raiseStepLimit", 0), "raiseStepLimit"),
            )
        )
    return result


def load_snapshot(path: str) -> dict[str, dict[str, Any]]:
    raw = load_json(path)
    items = raw.get("items")
    if not isinstance(items, list):
        raise ValueError("snapshot.items는 배열이어야 합니다.")

    result: dict[str, dict[str, Any]] = {}
    for item in items:
        sku = str(item.get("competitorSku", "")).strip()
        if not sku:
            continue
        result[sku] = item
    return result


def load_product_fixture(path: str | None) -> dict[str, Any]:
    if not path:
        return {}

    raw = load_json(path)
    products = raw.get("products")
    if not isinstance(products, list):
        raise ValueError("product fixture는 products 배열을 포함해야 합니다.")
    return {str(coerce_int(item.get("prodNo"), "prodNo")): item for item in products}


def build_imweb_command(imweb_bin: str, profile: str | None, *args: str) -> list[str]:
    command = shlex.split(imweb_bin)
    if not command:
        raise ValueError("imweb 실행 경로가 비어 있습니다.")
    command.extend(["--output", "json"])
    if profile:
        command.extend(["--profile", profile])
    command.extend(args)
    return command


def run_imweb_json(imweb_bin: str, profile: str | None, *args: str) -> dict[str, Any]:
    command = build_imweb_command(imweb_bin, profile, *args)
    completed = subprocess.run(command, capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        raise RuntimeError(
            f"imweb 호출 실패: {' '.join(command)}\n{completed.stderr.strip() or completed.stdout.strip()}"
        )
    try:
        return json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"imweb JSON 출력 해석 실패: {' '.join(command)}") from exc


def normalize_product_payload(payload: dict[str, Any]) -> dict[str, Any]:
    data = payload.get("data")
    if isinstance(data, dict):
        return data
    return payload


def fetch_product(
    policy: ProductPolicy,
    fixture_products: dict[str, Any],
    imweb_bin: str,
    profile: str | None,
) -> tuple[dict[str, Any], str]:
    fixture = fixture_products.get(str(policy.prod_no))
    if fixture is not None:
        return fixture, "fixture"

    payload = run_imweb_json(imweb_bin, profile, "product", "get", str(policy.prod_no))
    return payload, "imweb"


def build_price_update_manifest(
    imweb_bin: str,
    profile: str | None,
    prod_no: int,
    target_price: int,
    unit_code: str,
) -> dict[str, Any]:
    body = {"price": target_price, "unitCode": unit_code}
    body_json = json.dumps(body, ensure_ascii=False, separators=(",", ":"))
    command_args = [
        "product",
        "update",
        "price",
        str(prod_no),
        "--data",
        body_json,
        "--dry-run",
    ]
    argv = build_imweb_command(
        imweb_bin,
        profile,
        *command_args,
    )
    return {
        "reusable": True,
        "commandPath": "product update price",
        "args": command_args,
        "argv": argv,
        "shell": shlex.join(argv),
        "body": body,
        "bodyJson": body_json,
        "target": {"prodNo": prod_no, "unitCode": unit_code},
    }


def ceil_price(value: float) -> int:
    return int(math.ceil(value))


def clamp(value: int, minimum: int, maximum: int) -> int:
    return max(minimum, min(maximum, value))


def compute_safe_floor(policy: ProductPolicy) -> int:
    margin_floor = ceil_price(policy.cost * (1.0 + policy.min_margin_rate))
    return max(policy.floor_price, margin_floor)


def validate_policy(policy: ProductPolicy) -> int:
    safe_floor = compute_safe_floor(policy)
    if safe_floor > policy.ceiling_price:
        raise ValueError(
            f"prodNo={policy.prod_no} 정책이 모순됩니다: safeFloorPrice({safe_floor}) > ceilingPrice({policy.ceiling_price})"
        )
    return safe_floor


def build_plan_item(
    policy: ProductPolicy,
    snapshot_item: dict[str, Any] | None,
    product_payload: dict[str, Any],
    product_source: str,
) -> dict[str, Any]:
    product = normalize_product_payload(product_payload)
    current_price = coerce_int(product.get("price"), "product.price")
    competitor_price = (
        None if snapshot_item is None else coerce_int(snapshot_item.get("price"), "snapshot.price")
    )
    unit_code = product.get("unitCode")
    product_name = product.get("name")
    safe_floor = validate_policy(policy)

    reasons: list[str] = []
    trigger = "hold"
    desired_price = current_price

    if competitor_price is None:
        reasons.append("snapshot_missing")
        action = "skip"
    else:
        if competitor_price < current_price:
            trigger = "decrease"
            desired_price = competitor_price - policy.undercut_amount
            reasons.append("competitor_cheaper")
        elif competitor_price > current_price:
            trigger = "increase"
            desired_price = max(
                current_price,
                min(
                    competitor_price - policy.undercut_amount,
                    current_price + policy.raise_step_limit,
                ),
            )
            reasons.append("competitor_higher")
        else:
            reasons.append("competitor_same")

        protected_price = clamp(desired_price, safe_floor, policy.ceiling_price)
        if protected_price != desired_price:
            if protected_price == safe_floor:
                reasons.append("guarded_by_floor_or_margin")
            if protected_price == policy.ceiling_price:
                reasons.append("guarded_by_ceiling")
        if trigger == "increase" and protected_price < current_price:
            raise ValueError(
                f"prodNo={policy.prod_no} increase 경로가 현재가 아래로 내려갑니다: currentPrice({current_price}) > ceilingPrice({policy.ceiling_price})"
            )
        desired_price = protected_price
        action = "update" if desired_price != current_price else "hold"

    return {
        "prodNo": policy.prod_no,
        "name": product_name,
        "unitCode": unit_code,
        "competitorSku": policy.competitor_sku,
        "currentPrice": current_price,
        "competitorPrice": competitor_price,
        "targetPrice": desired_price,
        "floorPrice": policy.floor_price,
        "ceilingPrice": policy.ceiling_price,
        "safeFloorPrice": safe_floor,
        "minMarginRate": policy.min_margin_rate,
        "cost": policy.cost,
        "trigger": trigger,
        "action": action,
        "productSource": product_source,
        "reasons": reasons,
    }


def build_action_record(
    item: dict[str, Any],
    policy: ProductPolicy,
    snapshot_item: dict[str, Any] | None,
    imweb_bin: str,
    profile: str | None,
    mode: str,
) -> dict[str, Any]:
    unit_code = item.get("unitCode")
    command: dict[str, Any] | None = None
    if item["action"] == "update":
        if not isinstance(unit_code, str) or not unit_code.strip():
            raise RuntimeError(f"prodNo={item['prodNo']} 상품에 unitCode가 없습니다.")
        command = build_price_update_manifest(
            imweb_bin, profile, item["prodNo"], item["targetPrice"], unit_code
        )

    execution: dict[str, Any] = {
        "attempted": False,
        "status": "not_run" if item["action"] == "update" else "not_applicable",
        "response": None,
    }

    if mode == "dry_run" and item["action"] == "update":
        payload = run_imweb_json(imweb_bin, profile, *command["args"])
        execution = {
            "attempted": True,
            "status": "dry_run",
            "response": payload,
        }

    return {
        "prodNo": item["prodNo"],
        "name": item["name"],
        "unitCode": item["unitCode"],
        "competitorSku": item["competitorSku"],
        "decision": {
            "trigger": item["trigger"],
            "action": item["action"],
            "reasons": item["reasons"],
            "currentPrice": item["currentPrice"],
            "competitorPrice": item["competitorPrice"],
            "targetPrice": item["targetPrice"],
        },
        "guardrails": {
            "cost": policy.cost,
            "floorPrice": policy.floor_price,
            "ceilingPrice": policy.ceiling_price,
            "safeFloorPrice": item["safeFloorPrice"],
            "minMarginRate": policy.min_margin_rate,
            "undercutAmount": policy.undercut_amount,
            "raiseStepLimit": policy.raise_step_limit,
            "appliedReasons": [
                reason for reason in item["reasons"] if reason.startswith("guarded_by_")
            ],
        },
        "sources": {
            "policy": {
                "prodNo": policy.prod_no,
                "competitorSku": policy.competitor_sku,
            },
            "snapshot": {
                "kind": "snapshot" if snapshot_item is not None else "missing",
                "competitorSku": policy.competitor_sku,
                "capturedPrice": None if snapshot_item is None else item["competitorPrice"],
            },
            "product": {
                "kind": item["productSource"],
                "prodNo": item["prodNo"],
            },
        },
        "command": command
        if command is not None
        else {
            "reusable": False,
            "commandPath": "product update price",
            "args": None,
            "argv": None,
            "shell": None,
            "body": None,
            "bodyJson": None,
            "target": {"prodNo": item["prodNo"], "unitCode": item["unitCode"]},
        },
        "execution": execution,
    }


def main() -> int:
    args = parse_args()
    policies = load_policy(args.policy)
    snapshot_items = load_snapshot(args.snapshot)
    fixture_products = load_product_fixture(args.product_fixture)

    if args.execute_dry_run:
        for policy in policies:
            validate_policy(policy)

    mode = "dry_run" if args.execute_dry_run else "plan_only"
    plan_items = []
    action_items = []

    for policy in policies:
        snapshot_item = snapshot_items.get(policy.competitor_sku)
        product_payload, product_source = fetch_product(
            policy, fixture_products, args.imweb_bin, args.profile
        )
        item = build_plan_item(policy, snapshot_item, product_payload, product_source)
        plan_items.append(item)
        action_items.append(
            build_action_record(item, policy, snapshot_item, args.imweb_bin, args.profile, mode)
        )

    result = {
        "outputContract": "price-reaction.v1",
        "mode": mode,
        "planSummary": {
            "total": len(plan_items),
            "updates": sum(1 for item in plan_items if item["action"] == "update"),
            "holds": sum(1 for item in plan_items if item["action"] == "hold"),
            "skips": sum(1 for item in plan_items if item["action"] == "skip"),
        },
        "actions": action_items,
        "plan": plan_items,
        "executions": [item["execution"] for item in action_items],
    }

    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if args.plan_out:
        Path(args.plan_out).write_text(rendered + "\n", encoding="utf-8")
    print(rendered)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
