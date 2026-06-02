# Fragrantica Image Sync

This folder contains the image URL enrichment logic for perfume rows seeded
from Fragrantica-derived data.

Current MVP behavior:
- extract the numeric perfume ID from `source_url`
- build the public image URL hosted by `fimgs.net`
- store that URL directly in Supabase (`image_url`, `image_url_secondary`)

Why we keep source JPG URLs for now:
- avoids storing 70K images locally or in Supabase Storage
- keeps the seed pipeline simple and restartable
- `next/image` can still optimize delivery on the frontend

Future upgrade path:
- use the same extracted IDs to copy a curated subset into Cloudinary
- keep `fimgs.net` as the long-tail source for the full catalog
