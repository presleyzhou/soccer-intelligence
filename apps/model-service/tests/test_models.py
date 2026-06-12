import math
import unittest

from app.evaluation.metrics import brier_score, log_loss, ranked_probability_score
from app.models.elo import outcome_probabilities, update
from app.models.ensemble import weighted_pool
from app.models.poisson import score_matrix, summarize
from app.simulation.tournament import simulate_knockout


class ModelTests(unittest.TestCase):
    def test_elo_probabilities_sum_to_one(self) -> None:
        probabilities = outcome_probabilities(2000, 1900)
        self.assertAlmostEqual(sum(probabilities), 1.0, places=12)
        self.assertGreater(probabilities[0], probabilities[2])

    def test_elo_update_is_zero_sum(self) -> None:
        first, second = update(1900, 1900, 1.0)
        self.assertAlmostEqual(first + second, 3800.0)

    def test_dixon_coles_matrix_is_normalized(self) -> None:
        matrix = score_matrix(1.4, 1.1)
        self.assertAlmostEqual(sum(sum(row) for row in matrix), 1.0, places=10)
        summary = summarize(matrix)
        self.assertAlmostEqual(float(summary["home"]) + float(summary["draw"]) + float(summary["away"]), 1.0, places=10)

    def test_ensemble_is_normalized(self) -> None:
        result = weighted_pool([[0.5, 0.25, 0.25], [0.3, 0.3, 0.4]], [2, 1])
        self.assertAlmostEqual(sum(result.values()), 1.0)

    def test_metrics_reward_better_forecasts(self) -> None:
        outcomes = [0, 1, 2]
        good = [[0.8, 0.1, 0.1], [0.1, 0.8, 0.1], [0.1, 0.1, 0.8]]
        bad = [[0.1, 0.1, 0.8], [0.8, 0.1, 0.1], [0.8, 0.1, 0.1]]
        self.assertLess(log_loss(good, outcomes), log_loss(bad, outcomes))
        self.assertLess(brier_score(good, outcomes), brier_score(bad, outcomes))
        self.assertLess(ranked_probability_score(good, outcomes), ranked_probability_score(bad, outcomes))

    def test_simulation_is_deterministic_and_normalized(self) -> None:
        teams = ["a", "b", "c", "d"]
        strengths = {"a": 2100, "b": 2000, "c": 1900, "d": 1800}
        first = simulate_knockout(teams, strengths, iterations=2000, seed=42)
        second = simulate_knockout(teams, strengths, iterations=2000, seed=42)
        self.assertEqual(first, second)
        self.assertTrue(math.isclose(sum(first.values()), 1.0))


if __name__ == "__main__":
    unittest.main()
