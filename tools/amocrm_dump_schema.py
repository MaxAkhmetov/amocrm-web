#!/usr/bin/env python3
"""Dump amoCRM account schema to local JSON and Markdown files.

Reads AMOCRM_BASE_URL and AMOCRM_ACCESS_TOKEN from environment variables.
The access token is never printed or written to output files.
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


OUTPUT_DIR = Path("_local") / "amocrm_schema"
RAW_JSON_PATH = OUTPUT_DIR / "amocrm_schema_raw.json"
REPORT_PATH = OUTPUT_DIR / "amocrm_schema_report.md"

RESPONSIBLE_USER_ID = "6391603"
TARGET_PIPELINE_NAME = "ПРОДАЖИ"
TARGET_STATUS_NAME = "ЛИД, ЗАЯВКА"
CONTACT_WEBSITE_FIELD_ID = 327399

ENDPOINTS = {
    "account": "/api/v4/account",
    "users": "/api/v4/users",
    "pipelines": "/api/v4/leads/pipelines",
    "lead_custom_fields": "/api/v4/leads/custom_fields?limit=250",
    "contact_custom_fields": "/api/v4/contacts/custom_fields?limit=250",
    "company_custom_fields": "/api/v4/companies/custom_fields?limit=250",
}


def main() -> int:
    base_url = normalize_base_url(os.environ.get("AMOCRM_BASE_URL", ""))
    access_token = os.environ.get("AMOCRM_ACCESS_TOKEN", "")

    if not base_url:
        print("ERROR: AMOCRM_BASE_URL environment variable is required.", file=sys.stderr)
        return 1

    if not access_token:
        print("ERROR: AMOCRM_ACCESS_TOKEN environment variable is required.", file=sys.stderr)
        return 1

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Fetching amoCRM schema from {base_url}")
    raw_dump: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "base_url": base_url,
        "endpoints": {},
    }

    for key, path in ENDPOINTS.items():
        print(f"Fetching {key}: {path}")
        raw_dump["endpoints"][key] = fetch_paginated(base_url, path, access_token)

    RAW_JSON_PATH.write_text(
        json.dumps(raw_dump, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    REPORT_PATH.write_text(build_report(raw_dump), encoding="utf-8")

    print(f"Raw JSON saved to {RAW_JSON_PATH}")
    print(f"Markdown report saved to {REPORT_PATH}")
    return 0


def normalize_base_url(value: str) -> str:
    value = value.strip().rstrip("/")
    if not value:
        return ""

    parsed = urllib.parse.urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise SystemExit("ERROR: AMOCRM_BASE_URL must be an absolute http(s) URL.")

    return value


def fetch_paginated(base_url: str, path: str, access_token: str) -> dict[str, Any]:
    pages: list[dict[str, Any]] = []
    next_url = build_url(base_url, path)
    page_number = 1

    while next_url:
        response = request_json(next_url, access_token)
        pages.append(
            {
                "page": page_number,
                "url": sanitize_url(next_url),
                "data": response,
            }
        )
        next_href = response.get("_links", {}).get("next", {}).get("href")
        next_url = next_href if isinstance(next_href, str) and next_href else ""
        page_number += 1

        if next_url:
            time.sleep(0.25)

    return {
        "path": path,
        "pages": pages,
        "items": flatten_embedded_items(pages),
    }


def build_url(base_url: str, path: str) -> str:
    if path.startswith("http://") or path.startswith("https://"):
        return path
    return f"{base_url}{path}"


def sanitize_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    return urllib.parse.urlunparse(
        (parsed.scheme, parsed.netloc, parsed.path, "", parsed.query, "")
    )


def request_json(url: str, access_token: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "User-Agent": "wm-site-amocrm-schema-dump/1.0",
        },
        method="GET",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"amoCRM API request failed: HTTP {error.code} for {sanitize_url(url)}\n{redact_secret(body, access_token)}"
        ) from error
    except urllib.error.URLError as error:
        raise RuntimeError(
            f"amoCRM API request failed for {sanitize_url(url)}: {error.reason}"
        ) from error

    if not body.strip():
        return {}

    return json.loads(body)


def redact_secret(text: str, secret: str) -> str:
    if not secret:
        return text
    return text.replace(secret, "[REDACTED]")


def flatten_embedded_items(pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []

    for page in pages:
        data = page.get("data", {})
        embedded = data.get("_embedded", {})
        if not isinstance(embedded, dict):
            continue

        for value in embedded.values():
            if isinstance(value, list):
                items.extend(item for item in value if isinstance(item, dict))
                break

    return items


def build_report(raw_dump: dict[str, Any]) -> str:
    endpoints = raw_dump["endpoints"]
    users = endpoints["users"]["items"]
    pipelines = endpoints["pipelines"]["items"]
    lead_fields = endpoints["lead_custom_fields"]["items"]
    contact_fields = endpoints["contact_custom_fields"]["items"]
    company_fields = endpoints["company_custom_fields"]["items"]

    lines: list[str] = [
        "# amoCRM schema report",
        "",
        f"Generated at: `{raw_dump['generated_at']}`",
        f"Base URL: `{raw_dump['base_url']}`",
        "",
    ]

    add_table(
        lines,
        "Pipelines",
        ["id", "name", "sort", "is_main"],
        ([value(item, "id"), value(item, "name"), value(item, "sort"), value(item, "is_main")] for item in pipelines),
    )

    lines.append("## Pipeline statuses")
    lines.append("")
    if not pipelines:
        lines.append("NOT FOUND")
        lines.append("")
    for pipeline in pipelines:
        pipeline_id = value(pipeline, "id")
        pipeline_name = value(pipeline, "name")
        lines.append(f"### {pipeline_name} (`{pipeline_id}`)")
        lines.append("")
        statuses = get_statuses(pipeline)
        add_table_body(
            lines,
            ["id", "name", "pipeline_id", "sort"],
            ([value(status, "id"), value(status, "name"), pipeline_id, value(status, "sort")] for status in statuses),
        )

    add_table(
        lines,
        "Users",
        ["id", "name", "email"],
        ([value(item, "id"), value(item, "name"), value(item, "email")] for item in users),
    )

    add_table(
        lines,
        "Lead custom fields",
        ["id", "name", "code", "type"],
        ([value(item, "id"), value(item, "name"), value(item, "code"), value(item, "type")] for item in lead_fields),
    )

    add_table(
        lines,
        "Contact custom fields",
        ["id", "name", "code", "type", "enums"],
        (
            [
                value(item, "id"),
                value(item, "name"),
                value(item, "code"),
                value(item, "type"),
                format_enums(item),
            ]
            for item in contact_fields
        ),
    )

    add_table(
        lines,
        "Company custom fields",
        ["id", "name", "code", "type"],
        ([value(item, "id"), value(item, "name"), value(item, "code"), value(item, "type")] for item in company_fields),
    )

    add_recommended_values(lines, raw_dump)

    return "\n".join(lines).rstrip() + "\n"


def add_table(
    lines: list[str],
    title: str,
    headers: list[str],
    rows: Any,
) -> None:
    lines.append(f"## {title}")
    lines.append("")
    add_table_body(lines, headers, rows)


def add_table_body(lines: list[str], headers: list[str], rows: Any) -> None:
    row_list = [list(row) for row in rows]
    if not row_list:
        lines.append("NOT FOUND")
        lines.append("")
        return

    lines.append("| " + " | ".join(headers) + " |")
    lines.append("| " + " | ".join("---" for _ in headers) + " |")
    for row in row_list:
        lines.append("| " + " | ".join(markdown_cell(item) for item in row) + " |")
    lines.append("")


def add_recommended_values(lines: list[str], raw_dump: dict[str, Any]) -> None:
    endpoints = raw_dump["endpoints"]
    pipelines = endpoints["pipelines"]["items"]
    contact_fields = endpoints["contact_custom_fields"]["items"]

    target_pipeline = find_by_name(pipelines, TARGET_PIPELINE_NAME)
    statuses = get_statuses(target_pipeline) if target_pipeline else []
    target_status = find_by_name(statuses, TARGET_STATUS_NAME)
    phone_field = find_by_code(contact_fields, "PHONE")
    website_field = find_by_id(contact_fields, CONTACT_WEBSITE_FIELD_ID)

    lines.append("## Recommended values for Cloudflare env")
    lines.append("")
    lines.append("| variable | value |")
    lines.append("| --- | --- |")
    lines.append(f"| AMOCRM_BASE_URL | {markdown_cell(raw_dump['base_url'])} |")
    lines.append(f"| AMOCRM_PIPELINE_ID | {markdown_cell(value(target_pipeline, 'id') if target_pipeline else 'NOT FOUND')} |")
    lines.append(f"| AMOCRM_STATUS_ID | {markdown_cell(value(target_status, 'id') if target_status else 'NOT FOUND')} |")
    lines.append(f"| AMOCRM_RESPONSIBLE_USER_ID | {RESPONSIBLE_USER_ID} |")
    lines.append(f"| contact phone field | {markdown_cell(format_field_reference(phone_field))} |")
    lines.append(f"| contact website field | {markdown_cell(format_field_reference(website_field))} |")
    lines.append("")


def get_statuses(pipeline: dict[str, Any] | None) -> list[dict[str, Any]]:
    if not pipeline:
        return []
    statuses = pipeline.get("_embedded", {}).get("statuses", [])
    return statuses if isinstance(statuses, list) else []


def find_by_name(items: list[dict[str, Any]], name: str) -> dict[str, Any] | None:
    target = name.casefold()
    for item in items:
        if str(item.get("name", "")).casefold() == target:
            return item
    return None


def find_by_code(items: list[dict[str, Any]], code: str) -> dict[str, Any] | None:
    target = code.casefold()
    for item in items:
        if str(item.get("code", "")).casefold() == target:
            return item
    return None


def find_by_id(items: list[dict[str, Any]], item_id: int) -> dict[str, Any] | None:
    for item in items:
        if item.get("id") == item_id:
            return item
    return None


def value(item: dict[str, Any] | None, key: str) -> str:
    if not item:
        return "NOT FOUND"
    item_value = item.get(key)
    if item_value is None or item_value == "":
        return "NOT FOUND"
    return str(item_value)


def format_field_reference(field: dict[str, Any] | None) -> str:
    if not field:
        return "NOT FOUND"
    return f"id={value(field, 'id')}, name={value(field, 'name')}, code={value(field, 'code')}, type={value(field, 'type')}"


def format_enums(field: dict[str, Any]) -> str:
    enums = field.get("enums")
    if not isinstance(enums, list) or not enums:
        return "NOT FOUND"

    formatted = []
    for enum in enums:
        if not isinstance(enum, dict):
            continue
        enum_id = value(enum, "id")
        enum_value = value(enum, "value")
        enum_code = value(enum, "code")
        formatted.append(f"{enum_id}: {enum_value} ({enum_code})")

    return "; ".join(formatted) if formatted else "NOT FOUND"


def markdown_cell(item: Any) -> str:
    text = str(item)
    if not text:
        return "NOT FOUND"
    return text.replace("\\", "\\\\").replace("|", "\\|").replace("\n", "<br>")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Interrupted.", file=sys.stderr)
        raise SystemExit(130)
