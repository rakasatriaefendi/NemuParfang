from typing import Iterable

import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def build_tfidf_retriever(texts: Iterable[str], min_df: int = 2, max_features: int = 5000):
    vectorizer = TfidfVectorizer(min_df=min_df, max_features=max_features, ngram_range=(1, 2))
    matrix = vectorizer.fit_transform(list(texts))
    return vectorizer, matrix


def retrieve_top_k(df: pd.DataFrame, query_text: str, vectorizer: TfidfVectorizer, matrix, top_k: int = 10) -> pd.DataFrame:
    query_vec = vectorizer.transform([query_text])
    scores = cosine_similarity(query_vec, matrix).ravel()
    top_indices = np.argsort(scores)[::-1][:top_k]
    results = df.iloc[top_indices].copy()
    results["baseline_score"] = scores[top_indices]
    return results
