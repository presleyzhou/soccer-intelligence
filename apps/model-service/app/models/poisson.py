from __future__ import annotations

import math
from typing import List, Tuple


Matrix = List[List[float]]


def poisson_probability(goals: int, rate: float) -> float:
    return math.exp(-rate) * rate**goals / math.factorial(goals)


def expected_goals(
    home_attack: float,
    home_defense: float,
    away_attack: float,
    away_defense: float,
    neutral: bool = True,
    home_lineup_adjustment: float = 0.0,
    away_lineup_adjustment: float = 0.0,
) -> Tuple[float, float]:
    home_advantage = 1.0 if neutral else 1.11
    home_rate = 1.28 * home_attack / away_defense * home_advantage * math.exp(home_lineup_adjustment)
    away_rate = 1.22 * away_attack / home_defense * math.exp(away_lineup_adjustment)
    return max(0.15, min(4.2, home_rate)), max(0.15, min(4.2, away_rate))


def dixon_coles_factor(home_goals: int, away_goals: int, home_rate: float, away_rate: float, rho: float) -> float:
    if home_goals == 0 and away_goals == 0:
        return 1.0 - home_rate * away_rate * rho
    if home_goals == 0 and away_goals == 1:
        return 1.0 + home_rate * rho
    if home_goals == 1 and away_goals == 0:
        return 1.0 + away_rate * rho
    if home_goals == 1 and away_goals == 1:
        return 1.0 - rho
    return 1.0


def score_matrix(home_rate: float, away_rate: float, max_goals: int = 8, rho: float = -0.08) -> Matrix:
    matrix: Matrix = []
    for home_goals in range(max_goals + 1):
        row = []
        for away_goals in range(max_goals + 1):
            probability = (
                poisson_probability(home_goals, home_rate)
                * poisson_probability(away_goals, away_rate)
                * dixon_coles_factor(home_goals, away_goals, home_rate, away_rate, rho)
            )
            row.append(max(0.0, probability))
        matrix.append(row)
    total = sum(sum(row) for row in matrix)
    return [[value / total for value in row] for row in matrix]


def aggregate_1x2(matrix: Matrix) -> Tuple[float, float, float]:
    home = draw = away = 0.0
    for home_goals, row in enumerate(matrix):
        for away_goals, probability in enumerate(row):
            if home_goals > away_goals:
                home += probability
            elif home_goals == away_goals:
                draw += probability
            else:
                away += probability
    return home, draw, away


def top_scorelines(matrix: Matrix, limit: int = 5) -> List[Tuple[int, int, float]]:
    values = [
        (home_goals, away_goals, probability)
        for home_goals, row in enumerate(matrix)
        for away_goals, probability in enumerate(row)
    ]
    return sorted(values, key=lambda value: value[2], reverse=True)[:limit]


def both_teams_score(matrix: Matrix) -> float:
    return sum(
        probability
        for home_goals, row in enumerate(matrix)
        for away_goals, probability in enumerate(row)
        if home_goals > 0 and away_goals > 0
    )


def over_25(matrix: Matrix) -> float:
    return sum(
        probability
        for home_goals, row in enumerate(matrix)
        for away_goals, probability in enumerate(row)
        if home_goals + away_goals >= 3
    )
