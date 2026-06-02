"""Seed NemuParfang catalog data into Supabase in safe, restartable batches.

Examples:
  python backend/supabase/seed_perfumes.py --limit 100
  python backend/supabase/seed_perfumes.py --limit 100 --commit
  python backend/supabase/seed_perfumes.py --commit

The CSV row index is written as perfumes.id so Supabase IDs stay aligned with
the Pinecone vector IDs used by the ML API. Because the source CSV contains
known duplicate source_url values, perfumes are upserted by id rather than
source_url.
"""

from __future__ import annotations

import argparse
import csv
import http.client
import json
import os
import sys
import time
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.fragrantica_image_sync.image_urls import build_fragrantica_image_urls

DEFAULT_CSV_PATH = ROOT_DIR / "nemuparfang-api" / "data" / "perfume_cleaned_export.csv"
ENV_PATHS = [ROOT_DIR / ".env", ROOT_DIR / "frontend" / ".env.local"]
BATCH_SIZE = 500
JUNCTION_BATCH_SIZE = 250
REQUEST_TIMEOUT_SECONDS = 180
MAX_RETRIES = 5


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


def load_known_env_files() -> None:
    for path in ENV_PATHS:
        load_env_file(path)


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


def optional_release_year(value: object) -> int | None:
    year = optional_int(value)
    if year is None:
        return None
    return year if 1700 <= year <= 2100 else None


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
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                with urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
                    payload = response.read()
                return json.loads(payload) if payload else []
            except HTTPError as error:
                detail = error.read().decode("utf-8", errors="replace")
                if attempt < MAX_RETRIES and error.code >= 500:
                    print(f"    retrying {table} after HTTP {error.code} (attempt {attempt}/{MAX_RETRIES})")
                    time.sleep(attempt * 2)
                    continue
                raise RuntimeError(f"Supabase upsert failed for {table}: HTTP {error.code}: {detail}") from error
            except TimeoutError as error:
                if attempt < MAX_RETRIES:
                    print(f"    retrying {table} after timeout (attempt {attempt}/{MAX_RETRIES})")
                    time.sleep(attempt * 2)
                    continue
                raise RuntimeError(f"Supabase upsert timed out for {table} after {MAX_RETRIES} attempts.") from error
            except URLError as error:
                if attempt < MAX_RETRIES:
                    print(f"    retrying {table} after connection error (attempt {attempt}/{MAX_RETRIES}): {error.reason}")
                    time.sleep(attempt * 2)
                    continue
                raise RuntimeError(f"Supabase upsert failed for {table} after connection errors: {error.reason}") from error
            except (ConnectionResetError, http.client.RemoteDisconnected) as error:
                if attempt < MAX_RETRIES:
                    print(f"    retrying {table} after remote disconnect (attempt {attempt}/{MAX_RETRIES}): {error}")
                    time.sleep(attempt * 2)
                    continue
                raise RuntimeError(f"Supabase upsert failed for {table} after remote disconnects: {error}") from error


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
            source_url = clean_text(row.get("url")) or None
            image_urls = build_fragrantica_image_urls(source_url)
            perfumes.append(
                {
                    "id": perfume_id,
                    "source_url": source_url,
                    "name": clean_text(row.get("perfume_name")),
                    "brand": clean_text(row.get("brand")),
                    "country": clean_text(row.get("country")) or None,
                    "gender": clean_text(row.get("gender")) or "unisex",
                    "rating": optional_float(row.get("rating")),
                    "review_count": optional_int(row.get("review_count")) or 0,
                    "release_year": optional_release_year(row.get("year")),
                    "description": clean_text(row.get("description")) or None,
                    "image_url": image_urls.image_url,
                    "image_url_secondary": image_urls.image_url_secondary,
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


def upsert_in_batches(
    client: SupabaseRest,
    table: str,
    rows: list[dict],
    conflicts: str,
    return_rows: bool = False,
    batch_size: int = BATCH_SIZE,
    start_batch: int = 1,
) -> list[dict]:
    results: list[dict] = []
    for batch_number, batch in enumerate(chunks(rows, batch_size), start=1):
        if batch_number < start_batch:
            continue
        print(f"  {table}: batch {batch_number}, rows {len(batch)}")
        results.extend(client.upsert(table, batch, conflicts, return_rows))
    return results


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV_PATH)
    parser.add_argument("--limit", type=int, default=None, help="Seed only the first N CSV rows.")
    parser.add_argument("--commit", action="store_true", help="Write data to Supabase. Without this flag, only validate.")
    parser.add_argument("--skip-perfumes", action="store_true", help="Skip re-upserting perfumes and focus on supporting tables.")
    parser.add_argument("--junction-batch-size", type=int, default=JUNCTION_BATCH_SIZE, help="Batch size for perfume_notes and perfume_accords upserts.")
    parser.add_argument("--only-perfume-notes", action="store_true", help="Seed only the perfume_notes relationship table.")
    parser.add_argument("--only-perfume-accords", action="store_true", help="Seed only the perfume_accords relationship table.")
    parser.add_argument("--start-batch", type=int, default=1, help="Resume the targeted junction table from this 1-based batch number.")
    args = parser.parse_args()

    if args.only_perfume_notes and args.only_perfume_accords:
        raise RuntimeError("Choose only one of --only-perfume-notes or --only-perfume-accords.")
    if args.start_batch < 1:
        raise RuntimeError("--start-batch must be 1 or greater.")

    load_known_env_files()
    perfumes, notes, accords, pending_note_links, pending_accord_links = read_catalog(args.csv, args.limit)
    print(f"Validated perfumes={len(perfumes)}, notes={len(notes)}, accords={len(accords)}")
    print(f"Prepared note_links={len(pending_note_links)}, accord_links={len(pending_accord_links)}")
    if not args.commit:
        print("Dry run only. Add --commit after reviewing these counts.")
        return

    url = os.getenv("SUPABASE_URL", "") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not service_role_key:
        raise RuntimeError("Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before using --commit.")

    client = SupabaseRest(url, service_role_key)
    if args.skip_perfumes or args.only_perfume_notes or args.only_perfume_accords:
        print("Skipping perfume catalog upsert and resuming supporting tables...")
    else:
        print("Upserting catalog...")
        upsert_in_batches(client, "perfumes", perfumes, "id")

    note_rows: list[dict] = []
    accord_rows: list[dict] = []

    if not args.only_perfume_accords:
        note_rows = upsert_in_batches(client, "notes", notes, "normalized_name", return_rows=True)
    if not args.only_perfume_notes:
        accord_rows = upsert_in_batches(client, "accords", accords, "normalized_name", return_rows=True)

    if not args.only_perfume_accords:
        note_ids = {clean_text(row["normalized_name"]): row["id"] for row in note_rows}
        note_links = [{"perfume_id": perfume_id, "note_id": note_ids[name], "note_type": note_type, "position": position} for perfume_id, name, note_type, position in pending_note_links]
        note_start_batch = args.start_batch if args.only_perfume_notes else 1
        upsert_in_batches(
            client,
            "perfume_notes",
            note_links,
            "perfume_id,note_id,note_type",
            batch_size=args.junction_batch_size,
            start_batch=note_start_batch,
        )

    if not args.only_perfume_notes:
        accord_ids = {clean_text(row["normalized_name"]): row["id"] for row in accord_rows}
        accord_links = [{"perfume_id": perfume_id, "accord_id": accord_ids[name], "position": position} for perfume_id, name, position in pending_accord_links]
        accord_start_batch = args.start_batch if args.only_perfume_accords else 1
        upsert_in_batches(
            client,
            "perfume_accords",
            accord_links,
            "perfume_id,accord_id",
            batch_size=args.junction_batch_size,
            start_batch=accord_start_batch,
        )

    print("Seed completed successfully.")


if __name__ == "__main__":
    main()
