import unittest

from fastapi.testclient import TestClient

from app.main import app


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health(self):
        response = self.client.get("/internal/v1/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_prediction_probability_contract(self):
        response = self.client.post(
            "/internal/v1/predict",
            json={
                "match_id": "test-match",
                "cutoff_at": "2026-06-12T12:00:00Z",
                "home": {
                    "team_id": "home",
                    "elo": 1980,
                    "attack": 1.1,
                    "defense": 1.0,
                    "rest_days": 6,
                    "travel_km": 200,
                },
                "away": {
                    "team_id": "away",
                    "elo": 1920,
                    "attack": 1.0,
                    "defense": 1.05,
                    "rest_days": 5,
                    "travel_km": 1400,
                },
                "market": {"home": 0.44, "draw": 0.29, "away": 0.27},
            },
        )
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertAlmostEqual(payload["home"] + payload["draw"] + payload["away"], 1.0, places=9)
        self.assertEqual(len(payload["scorelines"]), 5)


if __name__ == "__main__":
    unittest.main()
