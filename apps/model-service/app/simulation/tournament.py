import random
from collections import Counter
from typing import Dict, List, Mapping, Sequence


def draw_outcome(probabilities: Sequence[float], rng: random.Random) -> int:
    value = rng.random()
    if value < probabilities[0]:
        return 0
    if value < probabilities[0] + probabilities[1]:
        return 1
    return 2


def simulate_knockout(team_ids: Sequence[str], strengths: Mapping[str, float], iterations: int = 50000,
                      seed: int = 20260612) -> Dict[str, float]:
    if iterations < 1:
        raise ValueError("iterations must be positive")
    rng = random.Random(seed)
    champions: Counter[str] = Counter()
    for _ in range(iterations):
        active = list(team_ids)
        rng.shuffle(active)
        while len(active) > 1:
            winners: List[str] = []
            for index in range(0, len(active), 2):
                home, away = active[index], active[index + 1]
                home_strength = strengths[home]
                away_strength = strengths[away]
                home_probability = 1.0 / (1.0 + 10.0 ** ((away_strength - home_strength) / 400.0))
                winners.append(home if rng.random() < home_probability else away)
            active = winners
        champions[active[0]] += 1
    return {team_id: champions[team_id] / iterations for team_id in team_ids}
