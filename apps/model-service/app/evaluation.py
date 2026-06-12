from __future__ import annotations

import math
from typing import Dict, List


def evaluate(probabilities: List[List[float]], outcomes: List[int]) -> Dict[str, float]:
    if len(probabilities) != len(outcomes) or not outcomes:
        raise ValueError("Probabilities and outcomes must have equal non-zero length")
    log_loss = brier = rps = correct = 0.0
    for row, outcome in zip(probabilities, outcomes):
        if len(row) != 3 or outcome not in (0, 1, 2):
            raise ValueError("Expected three probabilities and outcome in 0..2")
        total = sum(row)
        normalized = [max(1e-15, value / total) for value in row]
        target = [1.0 if index == outcome else 0.0 for index in range(3)]
        log_loss -= math.log(normalized[outcome])
        brier += sum((probability - truth) ** 2 for probability, truth in zip(normalized, target))
        forecast_cdf = [normalized[0], normalized[0] + normalized[1]]
        target_cdf = [target[0], target[0] + target[1]]
        rps += 0.5 * sum((forecast - truth) ** 2 for forecast, truth in zip(forecast_cdf, target_cdf))
        correct += int(max(range(3), key=lambda index: normalized[index]) == outcome)
    count = len(outcomes)
    return {
        "log_loss": log_loss / count,
        "brier": brier / count,
        "rps": rps / count,
        "accuracy": correct / count,
        "sample_size": count,
    }
