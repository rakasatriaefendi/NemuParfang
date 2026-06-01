from __future__ import annotations

from typing import Iterable

import numpy as np
import pandas as pd


def _token_set(value: object) -> set[str]:
    if pd.isna(value):
        return set()
    text = str(value).replace(";", ",")
    return {token.strip().lower() for token in text.split(",") if token.strip()}


def _clean_text(value: object) -> str:
    if pd.isna(value):
        return ""
    return str(value).strip().lower()


def _overlap_ratio(preferred: set[str], observed: set[str]) -> float:
    if not preferred:
        return 0.0
    return len(preferred & observed) / max(len(preferred), 1)


def _year_window_score(user_profile: dict, perfume_row: pd.Series) -> float:
    year_value = perfume_row.get("year")
    if pd.isna(year_value):
        return 0.0

    year = float(year_value)
    min_year = user_profile.get("min_year")
    max_year = user_profile.get("max_year")

    if min_year is not None and year < min_year:
        return 0.0
    if max_year is not None and year > max_year:
        return 0.0
    if min_year is None and max_year is None:
        return 0.5
    return 1.0


def _note_set_from_row(perfume_row: pd.Series) -> set[str]:
    note_columns = ("notes_top", "notes_middle", "notes_base")
    note_sets = [_token_set(perfume_row.get(column)) for column in note_columns]
    return set().union(*note_sets)


def synthetic_user_profiles() -> list[dict]:
    return [
        {
            "profile_id": "woody_evening",
            "profile_family": "woody_evening",
            "gender": "unisex",
            "preferred_accords": ["woody", "amber", "vanilla"],
            "preferred_notes": ["sandalwood", "vanilla", "amber", "cedar"],
            "preferred_brands": ["xerjoff", "nishane", "mancera"],
            "preferred_countries": ["Italy", "France"],
            "min_year": 2005,
            "profile_text": "warm woody amber vanilla evening fragrance",
        },
        {
            "profile_id": "fresh_daily",
            "profile_family": "fresh_daily",
            "gender": "men",
            "preferred_accords": ["fresh", "citrus", "aromatic"],
            "preferred_notes": ["bergamot", "lemon", "grapefruit", "lavender"],
            "preferred_brands": ["dior", "chanel", "yves saint laurent"],
            "preferred_countries": ["France", "Italy"],
            "min_year": 1995,
            "profile_text": "fresh citrus aromatic clean daily fragrance",
        },
        {
            "profile_id": "floral_sweet",
            "profile_family": "floral_sweet",
            "gender": "women",
            "preferred_accords": ["floral", "sweet", "powdery"],
            "preferred_notes": ["jasmine", "rose", "vanilla", "iris"],
            "preferred_brands": ["lancome", "dior", "guerlain"],
            "preferred_countries": ["France"],
            "min_year": 1990,
            "profile_text": "soft floral sweet powdery elegant fragrance",
        },
        {
            "profile_id": "clean_office",
            "profile_family": "clean_office",
            "gender": "unisex",
            "preferred_accords": ["clean", "musky", "aromatic"],
            "preferred_notes": ["musk", "lavender", "bergamot", "neroli"],
            "preferred_brands": ["prada", "giorgio armani", "dolce & gabbana"],
            "preferred_countries": ["Italy", "France"],
            "min_year": 2000,
            "profile_text": "clean musky aromatic office safe fragrance",
        },
        {
            "profile_id": "sweet_date",
            "profile_family": "sweet_date",
            "gender": "women",
            "preferred_accords": ["vanilla", "amber", "sweet"],
            "preferred_notes": ["vanilla", "tonka bean", "caramel", "amber"],
            "preferred_brands": ["lancome", "yves saint laurent", "armani"],
            "preferred_countries": ["France", "Italy"],
            "min_year": 2005,
            "profile_text": "sweet vanilla amber date night fragrance",
        },
        {
            "profile_id": "oud_smoky",
            "profile_family": "oud_smoky",
            "gender": "unisex",
            "preferred_accords": ["oud", "smoky", "woody"],
            "preferred_notes": ["agarwood (oud)", "incense", "saffron", "amber"],
            "preferred_brands": ["amouage", "montale", "lattafa perfumes"],
            "preferred_countries": ["Oman", "United Arab Emirates", "France"],
            "min_year": 2000,
            "profile_text": "deep oud smoky woody luxurious fragrance",
        },
        {
            "profile_id": "marine_summer",
            "profile_family": "marine_summer",
            "gender": "men",
            "preferred_accords": ["marine", "fresh", "citrus"],
            "preferred_notes": ["sea notes", "bergamot", "grapefruit", "mint"],
            "preferred_brands": ["giorgio armani", "davidoff", "issey miyake"],
            "preferred_countries": ["Italy", "France"],
            "min_year": 1990,
            "profile_text": "marine aquatic citrus summer fresh fragrance",
        },
        {
            "profile_id": "powdery_vintage",
            "profile_family": "powdery_vintage",
            "gender": "women",
            "preferred_accords": ["powdery", "iris", "aldehydic"],
            "preferred_notes": ["iris", "violet", "aldehydes", "rose"],
            "preferred_brands": ["guerlain", "chanel", "lancome"],
            "preferred_countries": ["France"],
            "max_year": 2015,
            "profile_text": "powdery iris aldehydic elegant vintage fragrance",
        },
        {
            "profile_id": "green_earthy",
            "profile_family": "green_earthy",
            "gender": "unisex",
            "preferred_accords": ["green", "earthy", "aromatic"],
            "preferred_notes": ["vetiver", "moss", "fig", "galbanum"],
            "preferred_brands": ["hermes", "diptyque", "ds durga"],
            "preferred_countries": ["France", "United States"],
            "profile_text": "green earthy aromatic natural outdoors fragrance",
        },
        {
            "profile_id": "gourmand_cozy",
            "profile_family": "gourmand_cozy",
            "gender": "women",
            "preferred_accords": ["gourmand", "vanilla", "caramel"],
            "preferred_notes": ["vanilla", "caramel", "chocolate", "coffee"],
            "preferred_brands": ["montale", "mugler", "xerjoff"],
            "preferred_countries": ["France", "Italy"],
            "min_year": 2005,
            "profile_text": "gourmand vanilla caramel cozy dessert fragrance",
        },
        {
            "profile_id": "spicy_formal",
            "profile_family": "spicy_formal",
            "gender": "men",
            "preferred_accords": ["warm spicy", "woody", "amber"],
            "preferred_notes": ["cardamom", "cinnamon", "amber", "cedar"],
            "preferred_brands": ["tom ford", "dior", "chanel"],
            "preferred_countries": ["United States", "France"],
            "min_year": 2000,
            "profile_text": "warm spicy woody amber formal evening fragrance",
        },
        {
            "profile_id": "rose_oud",
            "profile_family": "rose_oud",
            "gender": "unisex",
            "preferred_accords": ["rose", "oud", "amber"],
            "preferred_notes": ["rose", "agarwood (oud)", "saffron", "amber"],
            "preferred_brands": ["montale", "mancera", "arabian oud"],
            "preferred_countries": ["France", "Saudi Arabia"],
            "min_year": 2000,
            "profile_text": "rose oud amber rich middle eastern fragrance",
        },
        {
            "profile_id": "fruity_youthful",
            "profile_family": "fruity_youthful",
            "gender": "women",
            "preferred_accords": ["fruity", "sweet", "floral"],
            "preferred_notes": ["berry fruits", "apple", "peach", "vanilla"],
            "preferred_brands": ["zara", "avon", "victoria's secret"],
            "preferred_countries": ["Spain", "United States"],
            "min_year": 2010,
            "profile_text": "fruity sweet playful youthful floral fragrance",
        },
        {
            "profile_id": "barbershop_clean",
            "profile_family": "barbershop_clean",
            "gender": "men",
            "preferred_accords": ["lavender", "aromatic", "fresh spicy"],
            "preferred_notes": ["lavender", "bergamot", "musk", "sage"],
            "preferred_brands": ["prada", "chanel", "dior"],
            "preferred_countries": ["Italy", "France"],
            "min_year": 1990,
            "profile_text": "barbershop lavender aromatic clean masculine fragrance",
        },
        {
            "profile_id": "white_floral_daytime",
            "profile_family": "white_floral_daytime",
            "gender": "women",
            "preferred_accords": ["white floral", "citrus", "musky"],
            "preferred_notes": ["orange blossom", "jasmine", "musk", "bergamot"],
            "preferred_brands": ["dior", "givenchy", "chanel"],
            "preferred_countries": ["France"],
            "min_year": 1995,
            "profile_text": "white floral citrus musky daytime elegant fragrance",
        },
    ]


def compute_relevance(user_profile: dict, perfume_row: pd.Series) -> int:
    user_accords = {item.strip().lower() for item in user_profile.get("preferred_accords", []) if item}
    user_notes = {item.strip().lower() for item in user_profile.get("preferred_notes", []) if item}
    user_countries = {_clean_text(item) for item in user_profile.get("preferred_countries", []) if item}
    perfume_accords = _token_set(perfume_row.get("accords"))
    perfume_notes = _note_set_from_row(perfume_row)
    accord_overlap = _overlap_ratio(user_accords, perfume_accords)
    note_overlap = _overlap_ratio(user_notes, perfume_notes)

    perfume_gender = _clean_text(perfume_row.get("gender"))
    user_gender = _clean_text(user_profile.get("gender"))
    gender_match = 1.0 if (not user_gender or perfume_gender in {user_gender, "unisex"}) else 0.0

    preferred_brands = {_clean_text(item) for item in user_profile.get("preferred_brands", []) if item}
    brand_match = 1.0 if _clean_text(perfume_row.get("brand")) in preferred_brands else 0.0
    country_match = 1.0 if _clean_text(perfume_row.get("country")) in user_countries else 0.0
    year_match = _year_window_score(user_profile, perfume_row)
    rating_norm = float(perfume_row.get("rating_norm", 0) or 0)
    review_count_norm = float(perfume_row.get("review_count_norm", 0) or 0)

    score = 0.0
    score += 2.2 * accord_overlap
    score += 1.4 * note_overlap
    score += 0.7 * gender_match
    score += 0.5 * brand_match
    score += 0.35 * country_match
    score += 0.5 * year_match
    score += 0.7 * rating_norm
    score += 0.35 * review_count_norm

    if accord_overlap >= 0.67 and note_overlap >= 0.35:
        score += 0.8
    if country_match and brand_match:
        score += 0.25
    if accord_overlap == 0 and note_overlap == 0:
        score -= 1.0
    if not gender_match:
        score -= 0.5

    if score >= 4.2:
        return 4
    if score >= 3.2:
        return 3
    if score >= 2.1:
        return 2
    if score >= 1.1:
        return 1
    return 0


def build_candidate_features(candidates: pd.DataFrame, user_profile: dict) -> pd.DataFrame:
    df = candidates.copy()
    user_accords = {item.strip().lower() for item in user_profile.get("preferred_accords", []) if item}
    user_notes = {item.strip().lower() for item in user_profile.get("preferred_notes", []) if item}
    preferred_brands = {_clean_text(item) for item in user_profile.get("preferred_brands", []) if item}
    preferred_countries = {_clean_text(item) for item in user_profile.get("preferred_countries", []) if item}
    user_gender = _clean_text(user_profile.get("gender"))

    df["accord_overlap_ratio"] = df["accords"].apply(
        lambda value: _overlap_ratio(user_accords, _token_set(value))
    )
    df["accord_overlap_count"] = df["accords"].apply(
        lambda value: len(user_accords & _token_set(value))
    )
    df["note_overlap_ratio"] = df.apply(
        lambda row: _overlap_ratio(user_notes, _note_set_from_row(row)),
        axis=1,
    )
    df["gender_match"] = df["gender"].fillna("").astype(str).str.lower().apply(
        lambda value: 1 if not user_gender or value in {user_gender, "unisex"} else 0
    )
    df["brand_match"] = df["brand"].fillna("").astype(str).str.lower().apply(
        lambda value: 1 if value in preferred_brands else 0
    )
    df["country_match"] = df["country"].fillna("").astype(str).str.lower().apply(
        lambda value: 1 if value in preferred_countries else 0
    )
    df["year_window_match"] = df["year"].apply(
        lambda value: _year_window_score(user_profile, pd.Series({"year": value}))
    )

    if "cosine_similarity_score" not in df.columns:
        df["cosine_similarity_score"] = 0.0
    df["cosine_similarity_score"] = pd.to_numeric(df["cosine_similarity_score"], errors="coerce").fillna(0.0)

    for column in ("rating_norm", "review_count_norm", "year_norm"):
        if column not in df.columns:
            df[column] = 0.0
        df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0.0)

    if "review_count" not in df.columns:
        df["review_count"] = 0
    df["popularity_score"] = df["rating_norm"] * np.log1p(pd.to_numeric(df["review_count"], errors="coerce").fillna(0))
    df["freshness_score"] = df["year_norm"] * (1.0 - df["review_count_norm"] * 0.25)

    return df


def feature_columns() -> list[str]:
    return [
        "cosine_similarity_score",
        "accord_overlap_ratio",
        "accord_overlap_count",
        "note_overlap_ratio",
        "gender_match",
        "brand_match",
        "country_match",
        "year_window_match",
        "rating_norm",
        "review_count_norm",
        "year_norm",
        "popularity_score",
        "freshness_score",
    ]
