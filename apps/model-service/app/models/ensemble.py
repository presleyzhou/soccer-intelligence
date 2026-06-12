from __future__ import annotations

from typing import Iterable, List, Sequence, Tuple


Probability = Tuple[float, float, float]


def normalize(values: Sequence[float]) -> Probability:
    clean = [max(0.0, float(value)) for value in values]
    total = sum(clean)
    if total == 0:
        return 1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0
    return clean[0] / total, clean[1] / total, clean[2] / total


def weighted_pool(predictions: Iterable[Probability], weights: Sequence[float]) -> Probability:
    rows: List[Probability] = list(predictions)
    if len(rows) != len(weights) or not rows:
        raise ValueError("Predictions and weights must have the same non-zero length")
    weight_total = sum(max(0.0, weight) for weight in weights)
    if weight_total == 0:
        raise ValueError("At least one ensemble weight must be positive")
    pooled = [
        sum(row[index] * max(0.0, weight) for row, weight in zip(rows, weights)) / weight_total
        for index in range(3)
    ]
    return normalize(pooled)
