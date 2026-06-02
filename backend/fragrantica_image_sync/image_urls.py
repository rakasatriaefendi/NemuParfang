"""Utilities for deriving Fragrantica image URLs from source perfume pages.

For the MVP we intentionally keep the original remote JPG URLs from Fragrantica.
That lets Next.js optimize delivery without storing 70K files locally or in a
separate bucket yet. A later Cloudinary migration can reuse the same extracted
Fragrantica IDs if needed.
"""

from __future__ import annotations

import re
from dataclasses import dataclass


FRAGRANTICA_PERFUME_ID_PATTERN = re.compile(r"-(\d+)\.html$")


@dataclass(frozen=True)
class FragranticaImageUrls:
    image_url: str | None
    image_url_secondary: str | None
    fragrantica_id: str | None


def build_fragrantica_image_urls(source_url: str | None) -> FragranticaImageUrls:
    source = (source_url or "").strip()
    if not source:
        return FragranticaImageUrls(None, None, None)

    match = FRAGRANTICA_PERFUME_ID_PATTERN.search(source)
    if not match:
        return FragranticaImageUrls(None, None, None)

    fragrantica_id = match.group(1)
    image_url = f"https://fimgs.net/mdimg/perfume/375x500.{fragrantica_id}.jpg"
    return FragranticaImageUrls(image_url=image_url, image_url_secondary=image_url, fragrantica_id=fragrantica_id)
