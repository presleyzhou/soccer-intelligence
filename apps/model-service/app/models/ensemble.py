from typing import Dict, Iterable, List, Sequence


def normalize(values: Sequence[float]) -> List[float]:
    sanitized = [max(0.0, float(value)) for value in values]
    total = sum(sanitized)
    if total == 0:
        return [1.0 / len(sanitized)] * len(sanitized)
    return [value / total for value in sanitized]


def weighted_pool(predictions: Iterable[Sequence[float]], weights: Sequence[float]) -> Dict[str, float]:
    prediction_list = list(predictions)
    if not prediction_list or len(prediction_list) != len(weights):
        raise ValueError("Predictions and weights must be non-empty and have equal length")
    normalized_weights = normalize(weights)
    pooled = [0.0, 0.0, 0.0]
    for prediction, weight in zip(prediction_list, normalized_weights):
        probability = normalize(prediction)
        for index in range(3):
            pooled[index] += probability[index] * weight
    home, draw, away = normalize(pooled)
    return {"home": home, "draw": draw, "away": away}
