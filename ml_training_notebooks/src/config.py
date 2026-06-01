from dataclasses import dataclass
from pathlib import Path
import os

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
INTERIM_DIR = DATA_DIR / "interim"
PROCESSED_DIR = DATA_DIR / "processed"
ARTIFACTS_DIR = ROOT_DIR / "artifacts"
OUTPUTS_DIR = ROOT_DIR / "outputs"
FIGURES_DIR = OUTPUTS_DIR / "figures"
MODELS_DIR = OUTPUTS_DIR / "models"
REPORTS_DIR = OUTPUTS_DIR / "reports"

# Load .env once at import time so notebook helpers can rely on it safely.
load_dotenv(ROOT_DIR / ".env")


@dataclass(frozen=True)
class PineconeSettings:
    api_key: str
    index_name: str = "nemuparfang-perfumes"
    cloud: str = "aws"
    region: str = "us-east-1"


def load_environment() -> PineconeSettings:
    load_dotenv(ROOT_DIR / ".env")
    return PineconeSettings(
        api_key=os.getenv("PINECONE_API_KEY", ""),
        index_name=os.getenv("PINECONE_INDEX_NAME", "nemuparfang-perfumes"),
        cloud=os.getenv("PINECONE_CLOUD", "aws"),
        region=os.getenv("PINECONE_REGION", "us-east-1"),
    )


def dataset_path() -> Path:
    filename = os.getenv("DATASET_FILENAME", "perfume_database_cleaned.xlsx")
    return RAW_DIR / filename


def ensure_directories() -> None:
    for path in (
        RAW_DIR,
        INTERIM_DIR,
        PROCESSED_DIR,
        ARTIFACTS_DIR,
        FIGURES_DIR,
        MODELS_DIR,
        REPORTS_DIR,
    ):
        path.mkdir(parents=True, exist_ok=True)
