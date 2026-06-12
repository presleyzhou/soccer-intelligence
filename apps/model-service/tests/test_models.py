import math
import unittest

from app.evaluation import evaluate
from app.models.elo import result_probabilities, update_ratings
from app.models.ensemble import weighted_pool
from app.models.poisson import aggregate_1x2, score_matrix


class ModelTests(unittest.TestCase):
    def test_elo_probabilities_sum_to_one(self):
        probabilities = result_probabilities(2050, 1900)
        self.assertAlmostEqual(sum(probabilities), 1.0, places=12)
        self.assertGreater(probabilities[0], probabilities[2])

    def test_elo_update_is_zero_sum(self):
        before = (1900, 1900)
        after = update_ratings(*before, score_a=1.0)
        self.assertAlmostEqual(sum(before), sum(after), places=12)

    def test_dixon_coles_matrix_is_probability_distribution(self):
        matrix = score_matrix(1.4, 1.1)
        self.assertAlmostEqual(sum(sum(row) for row in matrix), 1.0, places=12)
        self.assertAlmostEqual(sum(aggregate_1x2(matrix)), 1.0, places=12)

    def test_ensemble_normalizes(self):
        result = weighted_pool([(0.5, 0.3, 0.2), (0.4, 0.25, 0.35)], [0.6, 0.4])
        self.assertAlmostEqual(sum(result), 1.0, places=12)

    def test_metrics_are_finite(self):
        result = evaluate([[0.6, 0.25, 0.15], [0.2, 0.3, 0.5]], [0, 2])
        self.assertTrue(math.isfinite(result["log_loss"]))
        self.assertEqual(result["accuracy"], 1.0)


if __name__ == "__main__":
    unittest.main()
