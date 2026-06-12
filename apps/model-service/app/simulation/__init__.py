import math
import random
from collections import defaultdict
from typing import Dict, Iterable, List, Sequence

from app.schemas import SimulationTeam
from .tournament import simulate_knockout


def _win_probability(strength_a: float, strength_b: float) -> float:
    return 1.0 / (1.0 + math.exp(-(strength_a - strength_b) / 120.0))


def _play(team_a: SimulationTeam, team_b: SimulationTeam, rng: random.Random) -> SimulationTeam:
    return team_a if rng.random() < _win_probability(team_a.strength, team_b.strength) else team_b


def _group_order(group: Sequence[SimulationTeam], rng: random.Random) -> List[SimulationTeam]:
    points: Dict[str, int] = defaultdict(int)
    for index, home in enumerate(group):
        for away in group[index + 1:]:
            draw = 0.18 + 0.14 * math.exp(-abs(home.strength - away.strength) / 120.0)
            sample = rng.random()
            if sample < draw:
                points[home.team_id] += 1
                points[away.team_id] += 1
            elif sample < draw + (1.0 - draw) * _win_probability(home.strength, away.strength):
                points[home.team_id] += 3
            else:
                points[away.team_id] += 3
    return sorted(group, key=lambda team: (points[team.team_id], team.strength + rng.random() * 0.01), reverse=True)


def simulate_tournament(teams: Iterable[SimulationTeam], iterations: int, seed: int) -> Dict[str, Dict[str, float]]:
    team_list = list(teams)
    groups: Dict[str, List[SimulationTeam]] = defaultdict(list)
    for team in team_list:
        groups[team.group].append(team)
    if len(groups) < 2:
        raise ValueError("At least two groups are required")
    counts: Dict[str, Dict[str, int]] = {team.team_id: defaultdict(int) for team in team_list}
    rng = random.Random(seed)
    for _ in range(iterations):
        ordered = [_group_order(group, rng) for group in groups.values()]
        qualifiers = [team for group in ordered for team in group[:2]]
        target = 1
        while target * 2 <= len(team_list):
            target *= 2
        extras = sorted([team for group in ordered for team in group[2:]], key=lambda team: team.strength + rng.random() * 20, reverse=True)
        qualifiers.extend(extras[:max(0, target - len(qualifiers))])
        qualifiers = qualifiers[:target]
        initial = {32: "round_of_32", 16: "round_of_16", 8: "quarter_final", 4: "semi_final"}[len(qualifiers)]
        for team in qualifiers:
            counts[team.team_id][initial] += 1
        rng.shuffle(qualifiers)
        current = qualifiers
        while len(current) > 1:
            current = [_play(current[index], current[index + 1], rng) for index in range(0, len(current), 2)]
            stage = {8: "quarter_final", 4: "semi_final", 2: "final", 1: "champion"}.get(len(current), "round_of_16")
            for team in current:
                counts[team.team_id][stage] += 1
    stages = ("round_of_32", "round_of_16", "quarter_final", "semi_final", "final", "champion")
    return {team_id: {stage: counts[team_id][stage] / iterations for stage in stages} for team_id in counts}


__all__ = ["simulate_knockout", "simulate_tournament"]
