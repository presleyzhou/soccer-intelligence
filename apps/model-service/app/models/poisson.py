from math import exp, factorial
from typing import Dict, List, Tuple


def poisson_probability(goals: int, expected: float) -> float:
    if goals < 0 or expected <= 0:
        return 0.0
    return exp(-expected) * expected ** goals / factorial(goals)


def dixon_coles_adjustment(home_goals: int, away_goals: int, home_xg: float, away_xg: float,
                           rho: float = -0.08) -> float:
    if home_goals == 0 and away_goals == 0:
        return 1.0 - home_xg * away_xg * rho
    if home_goals == 0 and away_goals == 1:
        return 1.0 + home_xg * rho
    if home_goals == 1 and away_goals == 0:
        return 1.0 + away_xg * rho
    if home_goals == 1 and away_goals == 1:
        return 1.0 - rho
    return 1.0


def score_matrix(home_xg: float, away_xg: float, max_goals: int = 8,
                 rho: float = -0.08) -> List[List[float]]:
    matrix: List[List[float]] = []
    for home_goals in range(max_goals + 1):
        row = []
        for away_goals in range(max_goals + 1):
            probability = (
                poisson_probability(home_goals, home_xg)
                * poisson_probability(away_goals, away_xg)
                * dixon_coles_adjustment(home_goals, away_goals, home_xg, away_xg, rho)
            )
            row.append(max(0.0, probability))
        matrix.append(row)
    total = sum(sum(row) for row in matrix)
    return [[value / total for value in row] for row in matrix]


def summarize(matrix: List[List[float]]) -> Dict[str, object]:
    home = draw = away = over25 = btts = 0.0
    scores: List[Tuple[int, int, float]] = []
    for home_goals, row in enumerate(matrix):
        for away_goals, probability in enumerate(row):
            scores.append((home_goals, away_goals, probability))
            if home_goals > away_goals:
                home += probability
            elif home_goals == away_goals:
                draw += probability
            else:
                away += probability
            if home_goals + away_goals >= 3:
                over25 += probability
            if home_goals > 0 and away_goals > 0:
                btts += probability
    scores.sort(key=lambda item: item[2], reverse=True)
    return {
        "home": home,
        "draw": draw,
        "away": away,
        "over25": over25,
        "both_teams_score": btts,
        "scorelines": [{"home": h, "away": a, "probability": p} for h, a, p in scores[:5]],
    }
