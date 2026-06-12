from __future__ import annotations

import math
from typing import Tuple


def expected_score(rating_a: float, rating_b: float, home_advantage: float = 0.0) -> float:
    return 1.0 / (1.0 + 10.0 ** (-(rating_a + home_advantage - rating_b) / 400.0))


def update_ratings(
    rating_a: float,
    rating_b: float,
    score_a: float,
    k_factor: float = 24.0,
    home_advantage: float = 0.0,
) -> Tuple[float, float]:
    expected_a = expected_score(rating_a, rating_b, home_advantage)
    change = k_factor * (score_a - expected_a)
    return rating_a + change, rating_b - change


def result_probabilities(
    home_elo: float,
    away_elo: float,
    neutral: bool = True,
    draw_base: float = 0.27,
) -> Tuple[float, float, float]:
    advantage = 0.0 if neutral else 55.0
    expected = expected_score(home_elo, away_elo, advantage)
    closeness = math.exp(-abs(home_elo + advantage - away_elo) / 260.0)
    draw = min(0.36, max(0.14, draw_base * closeness + 0.08))
    decisive = 1.0 - draw
    home = decisive * expected
    away = decisive * (1.0 - expected)
    total = home + draw + away
    return home / total, draw / total, away / total
