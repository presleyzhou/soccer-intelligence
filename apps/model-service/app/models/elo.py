from dataclasses import dataclass
from math import exp
from typing import Tuple


@dataclass(frozen=True)
class EloConfig:
    scale: float = 400.0
    draw_base: float = 0.26
    draw_decay: float = 0.0012
    k_factor: float = 24.0


def outcome_probabilities(home_elo: float, away_elo: float, home_advantage: float = 0.0,
                          config: EloConfig = EloConfig()) -> Tuple[float, float, float]:
    difference = home_elo + home_advantage - away_elo
    decisive_home = 1.0 / (1.0 + 10.0 ** (-difference / config.scale))
    draw = max(0.15, config.draw_base * exp(-config.draw_decay * abs(difference)))
    home = (1.0 - draw) * decisive_home
    away = (1.0 - draw) * (1.0 - decisive_home)
    total = home + draw + away
    return home / total, draw / total, away / total


def update(rating_a: float, rating_b: float, score_a: float, importance: float = 1.0,
           goal_margin: int = 1, config: EloConfig = EloConfig()) -> Tuple[float, float]:
    expected_a = 1.0 / (1.0 + 10.0 ** ((rating_b - rating_a) / config.scale))
    margin_multiplier = 1.0 + 0.25 * max(0, goal_margin - 1)
    delta = config.k_factor * importance * margin_multiplier * (score_a - expected_a)
    return rating_a + delta, rating_b - delta
