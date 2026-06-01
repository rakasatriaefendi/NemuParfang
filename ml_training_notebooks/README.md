# NemuParfang Training Notebooks

Folder ini dibuat khusus untuk workflow training model berdasarkan `planning_train_model.md`.
Semua file di dalamnya sengaja dibuat self-contained supaya eksperimen notebook tetap rapi dan tidak mencampuri struktur aplikasi utama.

## Struktur

```text
ml_training_notebooks/
├── .env.example
├── README.md
├── requirements.txt
├── artifacts/
│   └── .gitkeep
├── data/
│   ├── interim/
│   │   └── .gitkeep
│   ├── processed/
│   │   └── .gitkeep
│   └── raw/
│       └── .gitkeep
├── notebooks/
│   ├── 00_overview_and_setup.ipynb
│   ├── 01_data_prep_and_eda.ipynb
│   ├── 02_baseline_tfidf_retrieval.ipynb
│   ├── 03_embeddings_and_pinecone.ipynb
│   ├── 04_ranker_dataset_and_training.ipynb
│   └── 05_optuna_evaluation_and_export.ipynb
├── outputs/
│   ├── figures/
│   │   └── .gitkeep
│   ├── models/
│   │   └── .gitkeep
│   └── reports/
│       └── .gitkeep
└── src/
    ├── __init__.py
    ├── config.py
    ├── evaluation.py
    ├── features.py
    ├── pinecone_utils.py
    ├── preprocessing.py
    └── retrieval.py
```

## Notebook Flow

1. `00_overview_and_setup.ipynb`
   Menyiapkan environment, path, dan validasi dataset.
2. `01_data_prep_and_eda.ipynb`
   Load, inspeksi, cleaning, dan EDA dasar.
3. `02_baseline_tfidf_retrieval.ipynb`
   Baseline sanity check dengan TF-IDF + cosine similarity.
4. `03_embeddings_and_pinecone.ipynb`
   Generate sentence embeddings dan indexing ke Pinecone.
5. `04_ranker_dataset_and_training.ipynb`
   Synthetic label, feature engineering, dan training `LGBMRanker`.
6. `05_optuna_evaluation_and_export.ipynb`
   Tuning, evaluasi, dan export artifacts.

## Cara Pakai

1. Install dependency notebook:

   ```bash
   pip install -r requirements.txt
   ```

2. Salin `.env.example` menjadi `.env` lalu isi credential yang diperlukan.
3. Taruh dataset mentah di `data/raw/`.
4. Jalankan notebook berurutan dari `00` sampai `05`.

## Catatan Best Practice

- Notebook hanya dipakai untuk orchestration, visualisasi, dan eksperimen.
- Logic yang reusable dipindahkan ke `src/` supaya notebook tidak menjadi terlalu panjang.
- Output training dipisah ke `artifacts/` dan `outputs/models/`.
- Folder `data/` dibagi menjadi `raw`, `interim`, dan `processed` untuk menjaga lineage data tetap jelas.
