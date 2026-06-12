from math import log
from typing import Iterable, Sequence


def log_loss(probabilities: Iterable[Sequence[float]], outcomes: Iterable[int], epsilon: float = 1e-15) -> float:
    pairs = list(zip(probabilities, outcomes))
    if not pairs:
        raise ValueError("At least one observation is required")
    return -sum(log(max(epsilon, min(1.0 - epsilon, row[outcome]))) for row, outcome in pairs) / len(pairs)


def brier_score(probabilities: Iterable[Sequence[float]], outcomes: Iterable[int]) -> float:
    pairs = list(zip(probabilities, outcomes))
    if not pairs:
        raise ValueError("At least one observation is required")
    return sum(sum((probability - (1.0 if index == outcome else 0.0)) ** 2
                   for index, probability in enumerate(row)) for row, outcome in pairs) / len(pairs)


def ranked_probability_score(probabilities: Iterable[Sequence[float]], outcomes: Iterable[int]) -> float:
    pairs = list(zip(probabilities, outcomes))
    if not pairs:
        raise ValueError("At least one observation is required")
    total = 0.0
    for row, outcome in pairs:
        predicted_cumulative = [row[0], row[0] + row[1]]
        observed = [1.0 if outcome <= 0 else 0.0, 1.0 if outcome <= 1 else 0.0]
        total += sum((predicted_cumulative[index] - observed[index]) ** 2 for index in range(2)) / 2.0
    return total / len(pairs)
