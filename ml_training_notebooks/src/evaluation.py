from typing import Iterable

import numpy as np
from sklearn.metrics import ndcg_score


def evaluate_grouped_ndcg(model, X_test, y_test, test_groups: Iterable[int], k: int = 10) -> float:
    start = 0
    scores = []

    for group_size in test_groups:
        end = start + group_size
        preds = model.predict(X_test[start:end])
        score = ndcg_score([y_test[start:end]], [preds], k=k)
        scores.append(score)
        start = end

    return float(np.mean(scores))


def precision_at_k(y_true: np.ndarray, y_scores: np.ndarray, k: int = 5, threshold: int = 2) -> float:
    order = np.argsort(y_scores)[::-1][:k]
    relevant = (np.asarray(y_true)[order] >= threshold).astype(int)
    return float(relevant.mean())


def recall_at_k(y_true: np.ndarray, y_scores: np.ndarray, k: int = 10, threshold: int = 2) -> float:
    y_true = np.asarray(y_true)
    relevant_mask = y_true >= threshold
    total_relevant = int(relevant_mask.sum())
    if total_relevant == 0:
        return 0.0

    order = np.argsort(y_scores)[::-1][:k]
    hits = int(relevant_mask[order].sum())
    return float(hits / total_relevant)


def hit_rate_at_k(y_true: np.ndarray, y_scores: np.ndarray, k: int = 10, threshold: int = 2) -> float:
    y_true = np.asarray(y_true)
    order = np.argsort(y_scores)[::-1][:k]
    return float(int((y_true[order] >= threshold).any()))


def mrr_at_k(y_true: np.ndarray, y_scores: np.ndarray, k: int = 10, threshold: int = 2) -> float:
    y_true = np.asarray(y_true)
    order = np.argsort(y_scores)[::-1][:k]
    ranked_relevance = y_true[order] >= threshold
    hits = np.where(ranked_relevance)[0]
    if len(hits) == 0:
        return 0.0
    return float(1.0 / (hits[0] + 1))


def grouped_ranking_metrics(
    y_true: np.ndarray,
    y_scores: np.ndarray,
    groups: Iterable[int],
    k: int = 10,
    threshold: int = 2,
) -> dict[str, float]:
    start = 0
    ndcg_scores = []
    precision_scores = []
    recall_scores = []
    hit_rate_scores = []
    mrr_scores = []

    y_true = np.asarray(y_true)
    y_scores = np.asarray(y_scores)

    for group_size in groups:
        end = start + group_size
        group_true = y_true[start:end]
        group_scores = y_scores[start:end]
        ndcg_scores.append(ndcg_score([group_true], [group_scores], k=k))
        precision_scores.append(precision_at_k(group_true, group_scores, k=k, threshold=threshold))
        recall_scores.append(recall_at_k(group_true, group_scores, k=k, threshold=threshold))
        hit_rate_scores.append(hit_rate_at_k(group_true, group_scores, k=k, threshold=threshold))
        mrr_scores.append(mrr_at_k(group_true, group_scores, k=k, threshold=threshold))
        start = end

    return {
        f"ndcg@{k}": float(np.mean(ndcg_scores)),
        f"precision@{k}": float(np.mean(precision_scores)),
        f"recall@{k}": float(np.mean(recall_scores)),
        f"hit_rate@{k}": float(np.mean(hit_rate_scores)),
        f"mrr@{k}": float(np.mean(mrr_scores)),
    }
