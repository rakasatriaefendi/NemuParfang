"""Seed NemuParfang catalog data into Supabase in safe, restartable batches.

Examples:
  python backend/supabase/seed_perfumes.py --limit 100
  python backend/supabase/seed_perfumes.py --limit 100 --commit
  python backend/supabase/seed_perfumes.py --commit

The CSV row index is written as perfumes.id so Supabase IDs stay aligned with
the Pinecone vector IDs used by the ML API.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT_DIR = Path(__file__).resolve().parents[2]
DEFAULT_CSV_PATH = ROOT_DIR / "nemuparfang-api" / "data" / "perfume_cleaned_export.csv"
ENV_PATH = ROOT_DIR / "frontend" / ".env.local"
BATCH_SIZE = 400


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def chunks(items: list[dict], size: int = BATCH_SIZE) -> Iterable[list[dict]]:
    for start in range(0, len(items), size):
        yield items[start : start + size]


def clean_text(value: object) -> str:
    return str(value or "").strip()


def optional_int(value: object) -> int | None:
    text = clean_text(value)
    if not text:
        return None
    try:
        return int(float(text))
    except ValueError:
        return None


def optional_float(value: object) -> float:
    text = clean_text(value)
    if not text:
        return 0.0
    try:
        return round(float(text), 2)
    except ValueError:
        return 0.0


def split_tokens(value: object) -> list[str]:
    return [token.strip() for token in clean_text(value).replace(";", ",").split(",") if token.strip()]


class SupabaseRest:
    def __init__(self, url: str, service_role_key: str) -> None:
        self.base_url = f"{url.rstrip('/')}/rest/v1"
        self.headers = {
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Content-Type": "application/json",
        }

    def upsert(self, table: str, rows: list[dict], conflict_columns: str, return_rows: bool = False) -> list[dict]:
        if not rows:
            return []
        query = urlencode({"on_conflict": conflict_columns})
        request = Request(
            f"{self.base_url}/{table}?{query}",
            data=json.dumps(rows).encode("utf-8"),
            method="POST",
            headers={
                **self.headers,
                "Prefer": f"resolution=merge-duplicates,return={'representation' if return_rows else 'minimal'}",
            },
        )
        try:
            with urlopen(request, timeout=60) as response:
                payload = response.read()
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Supabase upsert failed for {table}: HTTP {error.code}: {detail}") from error
        return json.loads(payload) if payload else []


def read_catalog(csv_path: Path, limit: int | None) -> tuple[list[dict], list[dict], list[dict], list[dict], list[dict]]:
    perfumes: list[dict] = []
    note_names: dict[str, str] = {}
    accord_names: dict[str, str] = {}
    pending_note_links: list[tuple[int, str, str, int]] = []
    pending_accord_links: list[tuple[int, str, int]] = []

    with csv_path.open(newline="", encoding="utf-8-sig") as source:
        for perfume_id, row in enumerate(csv.DictReader(source)):
            if limit is not None and perfume_id >= limit:
                break
            perfumes.append(
                {
                    "id": perfume_id,
                    "source_url": clean_text(row.get("url")) or None,
                    "name": clean_text(row.get("perfume_name")),
                    "brand": clean_text(row.get("brand")),
                    "country": clean_text(row.get("country")) or None,
                    "gender": clean_text(row.get("gender")) or "unisex",
                    "rating": optional_float(row.get("rating")),
                    "review_count": optional_int(row.get("review_count")) or 0,
                    "release_year": optional_int(row.get("year")),
                    "perfumer_1": clean_text(row.get("perfumer1")) or None,
                    "perfumer_2": clean_text(row.get("perfumer2")) or None,
                }
            )
            for note_type, column in (("top", "notes_top"), ("middle", "notes_middle"), ("base", "notes_base")):
                for position, note in enumerate(split_tokens(row.get(column)), start=1):
                    normalized = note.lower()
                    note_names.setdefault(normalized, note)
                    pending_note_links.append((perfume_id, normalized, note_type, position))
            for position in range(1, 6):
                accord = clean_text(row.get(f"mainaccord{position}"))
                if not accord:
                    continue
                normalized = accord.lower()
                accord_names.setdefault(normalized, accord)
                pending_accord_links.append((perfume_id, normalized, position))

    notes = [{"name": name} for name in note_names.values()]
    accords = [{"name": name} for name in accord_names.values()]
    return perfumes, notes, accords, pending_note_links, pending_accord_links


def upsert_in_batches(client: SupabaseRest, table: str, rows: list[dict], conflicts: str, return_rows: bool = False) -> list[dict]:
    results: list[dict] = []
    for batch_number, batch in enumerate(chunks(rows), start=1):
        print(f"  {table}: batch {batch_number}, rows {len(batch)}")
        results.extend(client.upsert(table, batch, conflicts, return_rows))
    return results


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV_PATH)
    parser.add_argument("--limit", type=int, default=None, help="Seed only the first N CSV rows.")
    parser.add_argument("--commit", action="store_true", help="Write data to Supabase. Without this flag, only validate.")
    args = parser.parse_args()

    load_env_file(ENV_PATH)
    perfumes, notes, accords, pending_note_links, pending_accord_links = read_catalog(args.csv, args.limit)
    print(f"Validated perfumes={len(perfumes)}, notes={len(notes)}, accords={len(accords)}")
    print(f"Prepared note_links={len(pending_note_links)}, accord_links={len(pending_accord_links)}")
    if not args.commit:
        print("Dry run only. Add --commit after reviewing these counts.")
        return

    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not service_role_key:
        raise RuntimeError("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local before using --commit.")

    client = SupabaseRest(url, service_role_key)
    print("Upserting catalog...")
    upsert_in_batches(client, "perfumes", perfumes, "id")
    note_rows = upsert_in_batches(client, "notes", notes, "normalized_name", return_rows=True)
    accord_rows = upsert_in_batches(client, "accords", accords, "normalized_name", return_rows=True)
    note_ids = {clean_text(row["normalized_name"]): row["id"] for row in note_rows}
    accord_ids = {clean_text(row["normalized_name"]): row["id"] for row in accord_rows}
    note_links = [{"perfume_id": perfume_id, "note_id": note_ids[name], "note_type": note_type, "position": position} for perfume_id, name, note_type, position in pending_note_links]
    accord_links = [{"perfume_id": perfume_id, "accord_id": accord_ids[name], "position": position} for perfume_id, name, position in pending_accord_links]
    upsert_in_batches(client, "perfume_notes", note_links, "perfume_id,note_id,note_type")
    upsert_in_batches(client, "perfume_accords", accord_links, "perfume_id,accord_id")
    print("Seed completed successfully.")


if __name__ == "__main__":
    main()
