# NemuParfang — ML Training Plan

## Overview

Model utama yang dibangun adalah **Perfume Match Predictor** — sistem dua tahap (retrieval + ranking) yang menerima input profil user dan mengembalikan top-N parfum yang paling cocok.

Pipeline lengkap:
```
User Input → Sentence Transformers Encoding → Pinecone Retrieval → LGBMRanker → Top-10 Results
```

---

## Tech Stack ML

| Komponen | Tool | Alasan |
|---|---|---|
| Embedding | `sentence-transformers` | Semantik-aware, transfer learning siap pakai |
| Vector Store | **Pinecone** | Sudah familiar, production-ready, free tier cukup untuk MVP |
| Ranker | `lightgbm` (LGBMRanker) | Learning to Rank, modern, cepat |
| Hyperparameter Tuning | `optuna` | Lebih efisien dari GridSearch, visualisasi bagus |
| Backend Serving | **FastAPI** di **Hugging Face Spaces** | Gratis, Python-native, Docker-based |
| Data Processing | `pandas`, `numpy`, `scikit-learn` | Standard |
| Evaluasi | `scikit-learn`, manual NDCG | Metrik ranking |

---

## Deployment: Hugging Face Spaces

Backend **wajib Python** — dan ini ideal karena semua library ML native Python. Pilih tipe Space **FastAPI via Docker** bukan Gradio, supaya bisa dipakai sebagai REST API oleh frontend Next.js.

### Struktur Folder Space

```
nemuparfang-api/               ← nama Space di HF
├── app.py                  # FastAPI main app
├── Dockerfile
├── requirements.txt
├── models/
│   ├── similarity.py       # Pinecone retrieval logic
│   ├── ranker.py           # LGBMRanker inference
│   └── sentiment.py        # Sentiment analysis (Phase berikutnya)
├── utils/
│   ├── encoder.py          # Sentence Transformers wrapper
│   └── preprocess.py       # Input cleaning & vectorization
└── artifacts/
    ├── lgbm_ranker.pkl     # Trained model
    └── label_encoders.pkl  # Encoders untuk categorical features
```

### Catatan Penting HF Spaces

- Free tier: CPU only, RAM 16GB, storage 50GB — cukup untuk MVP
- Space **sleep setelah idle** — tambahkan keep-alive ping dari frontend
- Environment variables (Pinecone API key) di-set lewat Space Settings → Secrets
- Loading Sentence Transformers saat cold start bisa 15–30 detik — siapkan loading state di frontend

---

## Dataset

**Sumber utama:** Kaggle FragDB atau `rdemarqui/perfume_recommender` dataset

**Kolom yang dibutuhkan:**
```
perfume_name | brand | gender | concentration | notes_top | notes_middle | notes_base | accords | season | occasion | longevity | sillage | rating
```

**Kolom yang dibuat saat preprocessing:**
```
perfume_text  →  gabungan notes + accords + season + occasion (untuk embedding)
```

---

## Phase 1 — Data Preparation & EDA

### 1.1 Load & Inspect

```python
import pandas as pd

df = pd.read_excel('perfume_database_cleaned.xlsx')
print(df.shape)
print(df.isnull().sum())
print(df['accords'].value_counts().head(20))
```

### 1.2 Checklist EDA

- [ ] Distribusi gender (masculine / feminine / unisex)
- [ ] Top 30 most common notes
- [ ] Top 20 most common accords
- [ ] Distribusi longevity & sillage
- [ ] Missing values per kolom
- [ ] Distribusi season & occasion
- [ ] Brand distribution (top 50 brands)

### 1.3 Cleaning & Feature Construction

```python
# Gabungkan semua notes
df['notes_combined'] = (
    df['notes_top'].fillna('') + ' ' +
    df['notes_middle'].fillna('') + ' ' +
    df['notes_base'].fillna('')
).str.strip().str.lower()

# Buat perfume_text untuk embedding
df['perfume_text'] = (
    df['accords'].fillna('') + ' ' +
    df['notes_combined'] + ' ' +
    df['season'].fillna('') + ' ' +
    df['occasion'].fillna('')
).str.strip()

# Normalisasi longevity & sillage ke 0–1
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
df[['longevity_norm', 'sillage_norm']] = scaler.fit_transform(
    df[['longevity', 'sillage']].fillna(df[['longevity', 'sillage']].median())
)
```

---

## Phase 2 — Embedding & Pinecone Indexing

### 2.1 Generate Embeddings

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')  # 384-dim, ringan & cepat

perfume_texts = df['perfume_text'].tolist()
embeddings = model.encode(perfume_texts, batch_size=64, show_progress_bar=True)
# Shape: (n_perfumes, 384)
```

### 2.2 Upload ke Pinecone

```python
from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key="YOUR_PINECONE_API_KEY")

pc.create_index(
    name="nemuparfang-perfumes",
    dimension=384,
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)

index = pc.Index("nemuparfang-perfumes")

# Upsert vectors dengan metadata (batch 100)
vectors = []
for i, row in df.iterrows():
    vectors.append({
        "id": str(row['id']),
        "values": embeddings[i].tolist(),
        "metadata": {
            "name": row['perfume_name'],
            "brand": row['brand'],
            "gender": row['gender'],
            "season": row['season'],
            "occasion": row['occasion'],
            "accords": row['accords'],
            "longevity": float(row['longevity_norm']),
            "sillage": float(row['sillage_norm']),
            "rating": float(row.get('rating', 0)),
        }
    })
    if len(vectors) == 100:
        index.upsert(vectors=vectors)
        vectors = []

if vectors:
    index.upsert(vectors=vectors)
```

### 2.3 Test Retrieval

```python
user_text = "young adult date night warm weather elegant woody amber vanilla"
user_vec = model.encode(user_text).tolist()

results = index.query(vector=user_vec, top_k=50, include_metadata=True)

for match in results['matches'][:10]:
    print(f"{match['score']:.4f} | {match['metadata']['name']} — {match['metadata']['brand']}")
```

> Catatan: Pinecone free tier mendukung ~100K vectors. FragDB (130K) mungkin perlu ditrim ke parfum populer saja, atau upgrade ke Starter plan ($70/bulan) jika sudah production.

---

## Phase 3 — LGBMRanker (Learning to Rank)

### 3.1 Synthetic Relevance Labels

Karena belum ada data interaksi user nyata, buat relevance score dari karakteristik parfum:

```python
def compute_relevance(user_profile, perfume_row):
    score = 0

    # Accord overlap (bobot tertinggi)
    user_accords = set(user_profile['preferred_accords'])
    perfume_accords = set(str(perfume_row['accords']).lower().split(', '))
    overlap = len(user_accords & perfume_accords) / max(len(user_accords), 1)
    score += overlap * 3

    # Season match
    if perfume_row['season'] in [user_profile['weather_season'], 'all']:
        score += 1

    # Occasion match
    if perfume_row['occasion'] == user_profile['activity']:
        score += 1

    # Gender match
    if perfume_row['gender'] == user_profile['gender'] or perfume_row['gender'] == 'unisex':
        score += 0.5

    # Rating bonus
    score += float(perfume_row.get('rating', 0)) * 0.3

    return min(round(score), 4)  # scale 0–4 (NDCG standard)
```

### 3.2 Features untuk Ranker

```python
features = [
    'cosine_similarity_score',   # dari Pinecone
    'accord_overlap_ratio',
    'season_match',              # binary
    'occasion_match',            # binary
    'gender_match',              # binary
    'longevity_norm',
    'sillage_norm',
    'rating_norm',
    'popularity_score',          # rating × log(review_count + 1)
]
```

### 3.3 Train LGBMRanker

```python
from lightgbm import LGBMRanker
import lightgbm as lgb

model = LGBMRanker(
    objective="lambdarank",
    metric="ndcg",
    ndcg_eval_at=[5, 10],
    n_estimators=500,
    num_leaves=63,
    learning_rate=0.05,
    random_state=42,
)

model.fit(
    X_train, y_train,
    group=train_groups,
    eval_set=[(X_val, y_val)],
    eval_group=[val_groups],
    callbacks=[lgb.early_stopping(50), lgb.log_evaluation(50)]
)

import pickle
with open('artifacts/lgbm_ranker.pkl', 'wb') as f:
    pickle.dump(model, f)
```

---

## Phase 4 — Hyperparameter Tuning dengan Optuna

```python
import optuna
from lightgbm import LGBMRanker

def objective(trial):
    params = {
        "num_leaves": trial.suggest_int("num_leaves", 20, 127),
        "learning_rate": trial.suggest_float("learning_rate", 1e-4, 0.3, log=True),
        "n_estimators": trial.suggest_int("n_estimators", 100, 1000),
        "min_child_samples": trial.suggest_int("min_child_samples", 5, 100),
        "subsample": trial.suggest_float("subsample", 0.5, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 10.0, log=True),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 10.0, log=True),
    }

    ranker = LGBMRanker(objective="lambdarank", metric="ndcg", **params)
    ranker.fit(X_train, y_train, group=train_groups)
    return evaluate_ndcg(ranker, X_val, y_val, val_groups, k=10)

study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=100, timeout=3600)

print("Best params:", study.best_params)
print("Best NDCG@10:", study.best_value)

# Visualisasi untuk portfolio / presentasi
optuna.visualization.plot_param_importances(study).show()
optuna.visualization.plot_optimization_history(study).show()
```

---

## Phase 5 — FastAPI Serving di Hugging Face Spaces

### app.py

```python
import os
import pickle
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone

app = FastAPI(title="NemuParfang ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nemuparfang.vercel.app", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

encoder, ranker, pinecone_index = None, None, None

@app.on_event("startup")
async def load_models():
    global encoder, ranker, pinecone_index
    encoder = SentenceTransformer('all-MiniLM-L6-v2')
    with open('artifacts/lgbm_ranker.pkl', 'rb') as f:
        ranker = pickle.load(f)
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    pinecone_index = pc.Index("nemuparfang-perfumes")

class MatchRequest(BaseModel):
    age_group: str
    activity: str
    weather: str
    style: str
    preferred_accords: List[str]
    gender: str

@app.post("/match")
async def match_perfume(req: MatchRequest):
    user_text = f"{req.style} {req.activity} {req.weather} {' '.join(req.preferred_accords)}"
    user_vec = encoder.encode(user_text).tolist()

    results = pinecone_index.query(vector=user_vec, top_k=50, include_metadata=True)
    candidates = results['matches']

    features = build_features(req, candidates)
    scores = ranker.predict(features)

    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    return {"recommendations": [format_result(c, s) for c, s in ranked[:10]]}

@app.get("/health")
async def health():
    return {"status": "ok"}
```

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

### requirements.txt

```
fastapi==0.111.0
uvicorn==0.30.0
sentence-transformers==3.0.0
lightgbm==4.3.0
pinecone==4.0.0
pandas==2.2.0
numpy==1.26.0
scikit-learn==1.5.0
optuna==3.6.0
pydantic==2.7.0
python-dotenv==1.0.0
```

---

## Evaluasi Model

```python
from sklearn.metrics import ndcg_score
import numpy as np

def evaluate_model(ranker, X_test, y_test, test_groups, k=10):
    start = 0
    ndcg_scores = []

    for group_size in test_groups:
        end = start + group_size
        scores = ranker.predict(X_test[start:end])
        ndcg = ndcg_score([y_test[start:end]], [scores], k=k)
        ndcg_scores.append(ndcg)
        start = end

    print(f"NDCG@{k}: {np.mean(ndcg_scores):.4f} ± {np.std(ndcg_scores):.4f}")
    return np.mean(ndcg_scores)
```

**Target metrik:**

| Metrik | Target Minimum | Target Ideal |
|---|---|---|
| NDCG@10 | 0.70 | 0.85+ |
| NDCG@5 | 0.65 | 0.80+ |
| Precision@5 | 0.60 | 0.75+ |

---

## Urutan Pengerjaan

```
Week 1
├── EDA dataset (Kaggle FragDB / rdemarqui)
├── Data cleaning & preprocessing
└── Baseline: TF-IDF + cosine similarity (sanity check)

Week 2
├── Generate embeddings (Sentence Transformers)
├── Upload ke Pinecone
└── Test retrieval quality secara manual

Week 3
├── Buat synthetic training data (relevance labels)
├── Feature engineering
└── Train LGBMRanker baseline

Week 4
├── Optuna hyperparameter tuning
├── Evaluasi (NDCG@5, NDCG@10, Precision@5)
└── Deploy FastAPI ke Hugging Face Spaces

Week 5 (opsional)
└── Tambah Mood-to-Perfume & Sentiment Analysis endpoint
```
