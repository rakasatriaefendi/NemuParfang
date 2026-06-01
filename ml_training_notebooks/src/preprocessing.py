import ast
import json
import re
from pathlib import Path
from typing import Iterable
from urllib.parse import unquote

import pandas as pd
from sklearn.preprocessing import MinMaxScaler


REQUIRED_COLUMNS = [
    "perfume_name",
    "brand",
    "country",
    "gender",
    "rating",
    "review_count",
    "year",
    "notes_top",
    "notes_middle",
    "notes_base",
    "accords",
    "perfumer1",
    "perfumer2",
]

CANONICAL_EXPORT_COLUMNS = [
    "url",
    "perfume_name",
    "brand",
    "country",
    "gender",
    "rating",
    "review_count",
    "year",
    "notes_top",
    "notes_middle",
    "notes_base",
    "perfumer1",
    "perfumer2",
    "mainaccord1",
    "mainaccord2",
    "mainaccord3",
    "mainaccord4",
    "mainaccord5",
]

BRAND_NORMALIZATION_MAP = {
    "Al Haramain Perfumes": "Al Haramain Perfumes",
    "Alexandria Fragrances": "Alexandria Fragrances",
    "Bath Body Works": "Bath & Body Works",
    "Black Phoenix Alchemy Lab": "Black Phoenix Alchemy Lab",
    "Bond No 9": "Bond No. 9",
    "Bvlgari": "Bvlgari",
    "Carolina Herrera": "Carolina Herrera",
    "DS Durga": "D.S. & Durga",
    "Estee Lauder": "Estee Lauder",
    "H M": "H&M",
    "JAFRA": "JAFRA",
    "Jo Malone London": "Jo Malone London",
    "L Occitane en Provence": "L'Occitane en Provence",
    "L Oriflame": "Oriflame",
    "M Micallef": "M. Micallef",
    "O Boticario": "O Boticario",
    "Victoria s Secret": "Victoria's Secret",
    "Yves Saint Laurent": "Yves Saint Laurent",
}

BRAND_COUNTRY_MAP = {
    "Abdul Samad Al Qurashi": "Saudi Arabia",
    "Acqua di Parma": "Italy",
    "Adopt Parfums": "France",
    "Ajmal": "United Arab Emirates",
    "Al Haramain Perfumes": "United Arab Emirates",
    "Al Rehab": "Saudi Arabia",
    "Alexandria Fragrances": "United States",
    "Amouage": "Oman",
    "Arabian Oud": "Saudi Arabia",
    "Armaf": "United Arab Emirates",
    "Asgharali": "Bahrain",
    "Avon": "United States",
    "Bath & Body Works": "United States",
    "Black Phoenix Alchemy Lab": "United States",
    "Boadicea the Victorious": "United Kingdom",
    "Bond No. 9": "United States",
    "Bvlgari": "Italy",
    "Calvin Klein": "United States",
    "Caron": "France",
    "Carolina Herrera": "United States",
    "Chanel": "France",
    "Demeter Fragrance": "United States",
    "Dior": "France",
    "D.S. & Durga": "United States",
    "Donna Karan": "United States",
    "Dsquared2": "Canada",
    "Dzintars": "Latvia",
    "Estee Lauder": "United States",
    "Eudora": "Brazil",
    "Faberlic": "Russia",
    "Fragonard": "France",
    "Fueguia 1833": "Argentina",
    "Givenchy": "France",
    "Giorgio Armani": "Italy",
    "Guerlain": "France",
    "Hermes": "France",
    "Hugo Boss": "Germany",
    "JAFRA": "United States",
    "Jeanne Arthes": "France",
    "Jean Paul Gaultier": "France",
    "Jequiti": "Brazil",
    "Jo Malone London": "United Kingdom",
    "Kenzo": "France",
    "Lancome": "France",
    "Lattafa Perfumes": "United Arab Emirates",
    "L'Occitane en Provence": "France",
    "Maison Alhambra": "United Arab Emirates",
    "M. Micallef": "France",
    "Molinard": "France",
    "Montale": "France",
    "Mugler": "France",
    "Natura": "Brazil",
    "O Boticario": "Brazil",
    "Oriflame": "Sweden",
    "Pierre Guillaume Paris": "France",
    "Rasasi": "United Arab Emirates",
    "Roja Dove": "United Kingdom",
    "Swiss Arabian": "United Arab Emirates",
    "The Body Shop": "United Kingdom",
    "The Dua Brand": "United States",
    "Thera Cosmeticos": "Brazil",
    "Ulric de Varens": "France",
    "Victoria's Secret": "United States",
    "Xerjoff": "Italy",
    "Yves Rocher": "France",
    "Yves Saint Laurent": "France",
    "Zara": "Spain",
}

COUNTRY_KEYWORD_MAP = {
    "arabian": "Saudi Arabia",
    "boticario": "Brazil",
    "london": "United Kingdom",
    "parfum": "France",
    "parfums": "France",
    "paris": "France",
}


def load_dataset(path: Path) -> pd.DataFrame:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        last_error = None
        encodings = ("utf-8", "utf-8-sig", "cp1252", "latin1")

        with path.open("rb") as handle:
            sample = handle.read(4096)
        sample_text = sample.decode("latin1", errors="ignore")
        sep = ";" if sample_text.count(";") >= sample_text.count(",") else ","

        for encoding in encodings:
            try:
                return pd.read_csv(
                    path,
                    encoding=encoding,
                    sep=sep,
                    dtype=str,
                    engine="python",
                    on_bad_lines="skip",
                )
            except (UnicodeDecodeError, pd.errors.ParserError) as exc:
                last_error = exc

        try:
            return pd.read_csv(
                path,
                encoding="latin1",
                sep=sep,
                dtype=str,
                engine="python",
                on_bad_lines="skip",
            )
        except Exception as exc:
            last_error = exc

        raise last_error
    elif suffix in {".xlsx", ".xls"}:
        df = pd.read_excel(path)
    elif suffix == ".parquet":
        df = pd.read_parquet(path)
    else:
        raise ValueError(f"Unsupported dataset format: {suffix}")
    return df


def _normalize_column_name(column: object) -> str:
    return str(column).strip().lower().replace(" ", "_").replace("-", "_")


def _safe_literal_list(value: object) -> list[str]:
    if pd.isna(value):
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]

    text = str(value).strip()
    if not text or text in {"[]", "[null]"}:
        return []

    try:
        parsed = ast.literal_eval(text)
    except (ValueError, SyntaxError):
        parsed = None

    if isinstance(parsed, list):
        return [str(item).strip() for item in parsed if str(item).strip()]

    return [item.strip() for item in text.split(",") if item.strip()]


def _titleize_token(token: str) -> str:
    upper_tokens = {"bdk", "dsh", "jafra", "hm", "oud"}
    lower_tokens = {"and", "de", "di", "du", "en", "for", "la", "le", "no"}
    if not token:
        return ""
    if token.lower() in upper_tokens:
        return token.upper()
    if token.lower() in lower_tokens:
        return token.lower()
    return token.capitalize()


def _standardize_brand(value: object) -> object:
    if pd.isna(value):
        return pd.NA

    text = re.sub(r"\s+", " ", str(value).strip())
    if not text:
        return pd.NA

    text = " ".join(_titleize_token(part) for part in re.split(r"\s+", text))
    return BRAND_NORMALIZATION_MAP.get(text, text)


def _standardize_country(value: object) -> object:
    if pd.isna(value):
        return pd.NA
    text = re.sub(r"\s+", " ", str(value).strip())
    if not text or text in {"0", "nan", "none", "<na>"}:
        return pd.NA

    normalized = {
        "usa": "United States",
        "u.s.a.": "United States",
        "us": "United States",
        "uae": "United Arab Emirates",
        "u.a.e.": "United Arab Emirates",
        "uk": "United Kingdom",
        "u.k.": "United Kingdom",
    }.get(text.lower())
    if normalized:
        return normalized

    return " ".join(_titleize_token(part) for part in text.split())


def _infer_country_from_brand(brand: object) -> object:
    standardized_brand = _standardize_brand(brand)
    if pd.isna(standardized_brand):
        return pd.NA
    if standardized_brand in BRAND_COUNTRY_MAP:
        return BRAND_COUNTRY_MAP[standardized_brand]

    lowered = str(standardized_brand).lower()
    for keyword, country in COUNTRY_KEYWORD_MAP.items():
        if keyword in lowered:
            return country

    return pd.NA


def _standardize_gender(value: object) -> object:
    if pd.isna(value):
        return pd.NA
    text = re.sub(r"\s+", " ", str(value).strip().lower())
    mapping = {
        "for women": "women",
        "for men": "men",
        "for women and men": "unisex",
        "women": "women",
        "men": "men",
        "unisex": "unisex",
    }
    return mapping.get(text, pd.NA if not text else text)


def _split_note_text(text: object) -> list[str]:
    if pd.isna(text):
        return []
    cleaned = str(text).strip()
    if not cleaned:
        return []
    parts = re.split(r",|\band\b", cleaned, flags=re.IGNORECASE)
    notes = []
    for part in parts:
        note = re.sub(r"\s+", " ", part).strip(" .;:,'\"")
        if note:
            notes.append(note.lower())
    return notes


def _standardize_note_column(value: object) -> object:
    notes = _split_note_text(value)
    return ", ".join(dict.fromkeys(notes)) if notes else pd.NA


def _standardize_perfumer_name(value: object) -> object:
    if pd.isna(value):
        return pd.NA
    text = re.sub(r"\s+", " ", str(value).strip())
    if not text:
        return pd.NA
    return " ".join(_titleize_token(part) for part in text.split())


def _clean_accord_token(value: object) -> str:
    if pd.isna(value):
        return ""
    return re.sub(r"\s+", " ", str(value).strip().lower())


def _extract_accord_columns(value: object, size: int = 5) -> list[object]:
    accords = [_clean_accord_token(item) for item in _safe_literal_list(value)]
    accords = [item for item in accords if item]
    padded = accords[:size] + [pd.NA] * max(0, size - len(accords))
    return padded


def _slug_to_name(value: object) -> str:
    if pd.isna(value):
        return ""
    text = unquote(str(value)).strip().replace("-", " ")
    return re.sub(r"\s+", " ", text).strip()


def _extract_from_url(url: object) -> tuple[str, str]:
    if pd.isna(url):
        return "", ""

    text = str(url).strip().rstrip("/")
    match = re.search(r"/perfume/([^/]+)/([^/]+?)(?:-\d+)?\.html$", text, flags=re.IGNORECASE)
    if not match:
        return "", ""

    brand = _slug_to_name(match.group(1))
    perfume = _slug_to_name(match.group(2))
    return perfume, brand


def _extract_description_part(description: object, label: str) -> str:
    if pd.isna(description):
        return ""
    pattern = rf"{label}\s+notes?\s+are\s+(.*?)(?:[.;]|$)"
    match = re.search(pattern, str(description), flags=re.IGNORECASE)
    if not match:
        return ""
    return re.sub(r"\s+", " ", match.group(1)).strip()


def _extract_year(description: object) -> object:
    if pd.isna(description):
        return pd.NA
    match = re.search(r"launched in\s+(\d{4})", str(description), flags=re.IGNORECASE)
    return int(match.group(1)) if match else pd.NA


def _coerce_numeric(value: object, decimal_mode: str = "auto") -> object:
    if pd.isna(value):
        return pd.NA

    text = str(value).strip()
    if not text:
        return pd.NA

    text = text.replace("\u00a0", "").replace(" ", "")
    if decimal_mode == "rating":
        if "," in text and "." not in text:
            text = text.replace(",", ".")
        elif "," in text and "." in text:
            text = text.replace(",", "")
    else:
        text = text.replace(",", "")

    try:
        return float(text)
    except ValueError:
        return pd.NA


def _standardize_source_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    rename_map = {}
    for column in df.columns:
        normalized = _normalize_column_name(column)
        if normalized == "perfume":
            rename_map[column] = "perfume_name"
        elif normalized == "name":
            rename_map[column] = "name"
        elif normalized == "brand":
            rename_map[column] = "brand"
        elif normalized == "country":
            rename_map[column] = "country"
        elif normalized == "gender":
            rename_map[column] = "gender"
        elif normalized in {"rating_value", "rating"}:
            rename_map[column] = "rating"
        elif normalized in {"rating_count", "ratings_count"}:
            rename_map[column] = "review_count"
        elif normalized == "year":
            rename_map[column] = "year"
        elif normalized in {"top", "top_notes"}:
            rename_map[column] = "notes_top"
        elif normalized in {"middle", "middle_notes"}:
            rename_map[column] = "notes_middle"
        elif normalized in {"base", "base_notes"}:
            rename_map[column] = "notes_base"
        elif normalized == "description":
            rename_map[column] = "description"
        elif normalized == "perfumers":
            rename_map[column] = "perfumers"
        elif normalized == "main_accords":
            rename_map[column] = "main_accords"
        elif normalized == "perfumer1":
            rename_map[column] = "perfumer1"
        elif normalized == "perfumer2":
            rename_map[column] = "perfumer2"
        elif normalized.startswith("mainaccord"):
            rename_map[column] = normalized
        elif normalized in {"url", "source_url"}:
            rename_map[column] = "url"

    df = df.rename(columns=rename_map)

    accord_columns = [f"mainaccord{i}" for i in range(1, 6) if f"mainaccord{i}" in df.columns]
    if accord_columns:
        accord_frame = df[accord_columns].fillna("").astype(str)

        def _combine_accords(row: pd.Series) -> str:
            values = [value.strip() for value in row.tolist() if value and value.strip().lower() != "nan"]
            return ", ".join(values)

        df["accords"] = accord_frame.apply(_combine_accords, axis=1)
    elif "accords" not in df.columns:
        df["accords"] = pd.NA

    if "main_accords" in df.columns and "accords" in df.columns:
        missing_accords = df["accords"].isna() | (df["accords"].astype(str).str.strip() == "")
        if missing_accords.any():
            df.loc[missing_accords, "accords"] = (
                df.loc[missing_accords, "main_accords"]
                .apply(lambda value: ", ".join(_safe_literal_list(value)))
                .replace("", pd.NA)
            )

    if "main_accords" in df.columns:
        accord_values = df["main_accords"].apply(_extract_accord_columns)
        accord_frame = pd.DataFrame(
            accord_values.tolist(),
            index=df.index,
            columns=[f"mainaccord{i}" for i in range(1, 6)],
        )
        for column in accord_frame.columns:
            if column not in df.columns:
                df[column] = accord_frame[column]
            else:
                missing_column = df[column].isna() | (df[column].astype(str).str.strip() == "")
                df.loc[missing_column, column] = accord_frame.loc[missing_column, column]

    if "url" in df.columns:
        parsed_from_url = df["url"].apply(_extract_from_url)
        url_frame = pd.DataFrame(parsed_from_url.tolist(), index=df.index, columns=["perfume_name_from_url", "brand_from_url"])

        if "perfume_name" not in df.columns:
            df["perfume_name"] = url_frame["perfume_name_from_url"]
        else:
            df["perfume_name"] = df["perfume_name"].fillna("")
            missing_perfume = df["perfume_name"].astype(str).str.strip() == ""
            df.loc[missing_perfume, "perfume_name"] = url_frame.loc[missing_perfume, "perfume_name_from_url"]

        if "brand" not in df.columns:
            df["brand"] = url_frame["brand_from_url"]
        else:
            df["brand"] = df["brand"].fillna("")
            missing_brand = df["brand"].astype(str).str.strip() == ""
            df.loc[missing_brand, "brand"] = url_frame.loc[missing_brand, "brand_from_url"]

    if "description" in df.columns:
        for target, label in (
            ("notes_top", "top"),
            ("notes_middle", "middle"),
            ("notes_base", "base"),
        ):
            if target not in df.columns:
                df[target] = df["description"].apply(lambda value: _extract_description_part(value, label)).replace("", pd.NA)

        if "year" not in df.columns:
            df["year"] = df["description"].apply(_extract_year)

    if "perfumers" in df.columns:
        perfumer_lists = df["perfumers"].apply(_safe_literal_list)
        if "perfumer1" not in df.columns:
            df["perfumer1"] = perfumer_lists.apply(lambda items: items[0] if len(items) >= 1 else pd.NA)
        if "perfumer2" not in df.columns:
            df["perfumer2"] = perfumer_lists.apply(lambda items: items[1] if len(items) >= 2 else pd.NA)

    if "brand" in df.columns:
        df["brand"] = df["brand"].apply(_standardize_brand)

    if "country" in df.columns:
        df["country"] = df["country"].apply(_standardize_country)
        missing_country = df["country"].isna() | (df["country"].astype(str).str.strip() == "")
        df.loc[missing_country, "country"] = df.loc[missing_country, "brand"].apply(_infer_country_from_brand)
    else:
        df["country"] = df["brand"].apply(_infer_country_from_brand) if "brand" in df.columns else pd.NA

    if "gender" in df.columns:
        df["gender"] = df["gender"].apply(_standardize_gender)

    for note_column in ("notes_top", "notes_middle", "notes_base"):
        if note_column in df.columns:
            df[note_column] = df[note_column].apply(_standardize_note_column)

    if "accords" in df.columns:
        df["accords"] = df["accords"].apply(
            lambda value: ", ".join(dict.fromkeys(_split_note_text(value))) if not pd.isna(value) else pd.NA
        )
        df["accords"] = df["accords"].replace("", pd.NA)

    for perfumer_column in ("perfumer1", "perfumer2"):
        if perfumer_column in df.columns:
            df[perfumer_column] = df[perfumer_column].apply(_standardize_perfumer_name)

    for accord_column in [f"mainaccord{i}" for i in range(1, 6)]:
        if accord_column in df.columns:
            df[accord_column] = df[accord_column].apply(lambda value: _clean_accord_token(value) or pd.NA)

    for fallback_column in (
        "country",
        "year",
        "notes_top",
        "notes_middle",
        "notes_base",
        "perfumer1",
        "perfumer2",
        "perfume_name",
        "brand",
        "mainaccord1",
        "mainaccord2",
        "mainaccord3",
        "mainaccord4",
        "mainaccord5",
    ):
        if fallback_column not in df.columns:
            df[fallback_column] = pd.NA

    return df


def validate_columns(df: pd.DataFrame, required_columns: Iterable[str] = REQUIRED_COLUMNS) -> None:
    standardized = _standardize_source_columns(df)
    missing = sorted(set(required_columns) - set(standardized.columns))
    if missing:
        raise ValueError(f"Missing required columns after standardization: {missing}")


def clean_text(value: object) -> str:
    if pd.isna(value):
        return ""
    return str(value).strip().lower()


def prepare_perfume_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df = _standardize_source_columns(df)

    for column in REQUIRED_COLUMNS:
        if column not in df.columns:
            df[column] = pd.NA

    if "rating" in df.columns:
        df["rating"] = df["rating"].apply(lambda value: _coerce_numeric(value, decimal_mode="rating"))
    if "review_count" in df.columns:
        df["review_count"] = df["review_count"].apply(_coerce_numeric)
    if "year" in df.columns:
        df["year"] = df["year"].apply(_coerce_numeric)

    numeric_columns = ["rating", "review_count", "year"]
    for column in numeric_columns:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    year_text = df["year"].fillna(0)
    if hasattr(year_text, "infer_objects"):
        year_text = year_text.infer_objects(copy=False)

    df["notes_combined"] = (
        df["notes_top"].map(clean_text)
        + " "
        + df["notes_middle"].map(clean_text)
        + " "
        + df["notes_base"].map(clean_text)
    ).str.replace(r"\s+", " ", regex=True).str.strip()

    df["perfume_text"] = (
        df["accords"].map(clean_text)
        + " "
        + df["notes_combined"]
        + " "
        + df["brand"].map(clean_text)
        + " "
        + df["country"].map(clean_text)
        + " "
        + df["gender"].map(clean_text)
        + " "
        + year_text.astype(int).astype(str)
    ).str.replace(r"\s+", " ", regex=True).str.strip()

    rating = df[["rating"]].fillna(df[["rating"]].median())
    df["rating_norm"] = MinMaxScaler().fit_transform(rating)
    review_count = df[["review_count"]].fillna(df[["review_count"]].median())
    df["review_count_norm"] = MinMaxScaler().fit_transform(review_count)
    year = df[["year"]].fillna(df[["year"]].median())
    df["year_norm"] = MinMaxScaler().fit_transform(year)

    if "id" not in df.columns:
        df["id"] = df.index.astype(str)
    else:
        df["id"] = df["id"].astype(str)

    return df


def load_prepared_dataset(base_dir: Path) -> pd.DataFrame:
    parquet_path = base_dir / "perfume_prepared.parquet"
    csv_path = base_dir / "perfume_prepared.csv"

    if parquet_path.exists():
        try:
            return pd.read_parquet(parquet_path)
        except ImportError:
            pass

    if csv_path.exists():
        return pd.read_csv(csv_path)

    fallback = list(base_dir.glob("perfume_prepared.*"))
    if fallback:
        path = fallback[0]
        if path.suffix.lower() == ".csv":
            return pd.read_csv(path)
        if path.suffix.lower() == ".parquet":
            return pd.read_parquet(path)

    raise FileNotFoundError(f"No prepared dataset found in {base_dir}")


def build_clean_export_frame(df: pd.DataFrame) -> pd.DataFrame:
    prepared = prepare_perfume_dataframe(df)
    export_df = prepared.copy()
    for column in CANONICAL_EXPORT_COLUMNS:
        if column not in export_df.columns:
            export_df[column] = pd.NA
    return export_df[CANONICAL_EXPORT_COLUMNS].copy()


def save_dataframe(df: pd.DataFrame, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    suffix = path.suffix.lower()
    if suffix == ".csv":
        df.to_csv(path, index=False)
    elif suffix == ".parquet":
        try:
            df.to_parquet(path, index=False)
        except ImportError:
            fallback_path = path.with_suffix(".csv")
            df.to_csv(fallback_path, index=False)
            return fallback_path
    elif suffix in {".xlsx", ".xls"}:
        df.to_excel(path, index=False)
    else:
        raise ValueError(f"Unsupported output format: {suffix}")
    return path
