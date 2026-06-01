from typing import Iterable

import math


def _sanitize_metadata_value(value):
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return 0.0
    if hasattr(value, "item"):
        try:
            value = value.item()
        except Exception:
            pass
    if value is None:
        return ""
    if isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, list):
        return [str(item) for item in value if item is not None and str(item).strip()]
    return str(value)


def sanitize_metadata(metadata: dict) -> dict:
    return {key: _sanitize_metadata_value(value) for key, value in metadata.items()}

from pinecone import Pinecone, ServerlessSpec


def build_client(api_key: str) -> Pinecone:
    if not api_key:
        raise ValueError("Missing Pinecone API key. Set it in .env before using this module.")
    return Pinecone(api_key=api_key)


def create_index_if_missing(client: Pinecone, index_name: str, dimension: int, cloud: str, region: str) -> None:
    existing_indexes = {item["name"] for item in client.list_indexes()}
    if index_name not in existing_indexes:
        client.create_index(
            name=index_name,
            dimension=dimension,
            metric="cosine",
            spec=ServerlessSpec(cloud=cloud, region=region),
        )


def upsert_embeddings(index, rows: Iterable[dict], batch_size: int = 100) -> None:
    batch = []
    for row in rows:
        if "metadata" in row and isinstance(row["metadata"], dict):
            row = {**row, "metadata": sanitize_metadata(row["metadata"])}
        batch.append(row)
        if len(batch) >= batch_size:
            index.upsert(vectors=batch)
            batch = []

    if batch:
        index.upsert(vectors=batch)
