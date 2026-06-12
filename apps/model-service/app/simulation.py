from __future__ import annotations

import math
import random
from collections import defaultdict
from typing import Dict, Iterable, List, Sequence, Tuple

from .schemas import SimulationTeam


def _win_probability(strength_a: float, strength_b: float) -> float:
    return 1.0 / (1.0 + math.exp(-(strength_a - strength_b) / 120.0))


def _play_knockout(team_a: SimulationTeam, team_b: SimulationTeam, rng: random.Random) -> SimulationTeam:
    return team_a if rng.random() < _win_probability(team_a.strength, team_b.strength) else team_b


def _group_order(group: Sequence[SimulationTeam], rng: random.Random) -> List[SimulationTeam]:
    points: Dict[str, int] = defaultdict(int)
    goal_difference: Dict[str, float] = defaultdict(float)
    for index, home in enumerate(group):
        for away in group[index + 1 :]:
            expected = _win_probability(home.strength, away.strength)
            draw_probability = 0.18 + 0.14 * math.exp(-abs(home.strength - away.strength) / 120.0)
            sample = rng.random()
            if sample < draw_probability:
                points[home.team_id] += 1
                points[away.team_id] += 1
            elif sample < draw_probability + (1.0 - draw_probability) * expected:
                points[home.team_id] += 3
                goal_difference[home.team_id] += 1.0
                goal_difference[away.team_id] -= 1.0
            else:
                points[away.team_id] += 3
                goal_difference[away.team_id] += 1.0
                goal_difference[home.team_id] -= 1.0
    return sorted(
        group,
        key=lambda team: (points[team.team_id], goal_difference[team.team_id], team.strength + rng.random() * 0.01),
        reverse=True,
    )


def simulate_tournament(teams: Iterable[SimulationTeam], iterations: int, seed: int) -> Dict[str, Dict[str, float]]:
    team_list = list(teams)
    groups: Dict[str, List[SimulationTeam]] = defaultdict(list)
    for team in team_list:
        groups[team.group].append(team)
    if len(groups) < 2 or any(len(group) < 2 for group in groups.values()):
        raise ValueError("Simulation requires at least two groups with at least two teams each")

    counts: Dict[str, Dict[str, int]] = {
        team.team_id: defaultdict(int) for team in team_list
    }
    rng = random.Random(seed)
    for _ in range(iterations):
        ordered = [_group_order(group, rng) for group in groups.values()]
        qualifiers = [team for group in ordered for team in group[:2]]
        third_place = sorted(
            [group[2] for group in ordered if len(group) > 2],
            key=lambda team: team.strength + rng.random() * 30.0,
            reverse=True,
        )
        target_size = 1
        while target_size * 2 <= len(team_list):
            target_size *= 2
        target_size = max(4, target_size)
        qualifiers.extend(third_place[: max(0, target_size - len(qualifiers))])
        remaining = [
            team
            for group in ordered
            for team in group[3:]
            if team not in qualifiers
        ]
        remaining.sort(key=lambda team: team.strength + rng.random() * 20.0, reverse=True)
        qualifiers.extend(remaining[: max(0, target_size - len(qualifiers))])
        qualifiers = qualifiers[:target_size]
        initial_stage = {
            32: "round_of_32",
            16: "round_of_16",
            8: "quarter_final",
            4: "semi_final",
            2: "final",
        }.get(len(qualifiers), "round_of_32")
        for team in qualifiers:
            counts[team.team_id][initial_stage] += 1

        rng.shuffle(qualifiers)
        current = qualifiers
        while len(current) > 1:
            next_round = [_play_knockout(current[index], current[index + 1], rng) for index in range(0, len(current), 2)]
            stage_name = {
                16: "round_of_16",
                8: "quarter_final",
                4: "semi_final",
                2: "final",
                1: "champion",
            }[len(next_round)]
            for team in next_round:
                counts[team.team_id][stage_name] += 1
            current = next_round

    return {
        team_id: {
            stage: counts[team_id][stage] / iterations
            for stage in ("round_of_32", "round_of_16", "quarter_final", "semi_final", "final", "champion")
        }
        for team_id in counts
    }
