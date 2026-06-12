import unittest

from app.schemas import SimulationTeam
from app.simulation import simulate_tournament


class SimulationTests(unittest.TestCase):
    def test_simulation_returns_bounded_probabilities(self):
        teams = [
            SimulationTeam(team_id=f"t{index}", group=chr(65 + index // 4), strength=1800 + index * 10)
            for index in range(16)
        ]
        result = simulate_tournament(teams, iterations=1000, seed=42)
        self.assertEqual(len(result), 16)
        self.assertAlmostEqual(sum(row["champion"] for row in result.values()), 1.0, places=6)
        self.assertTrue(all(0 <= value <= 1 for row in result.values() for value in row.values()))


if __name__ == "__main__":
    unittest.main()
