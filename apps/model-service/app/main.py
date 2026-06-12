from datetime import datetime, timezone
from fastapi import FastAPI

from app.evaluation.metrics import brier_score, log_loss, ranked_probability_score
from app.models.elo import outcome_probabilities
from app.models.ensemble import weighted_pool
from app.models.poisson import score_matrix, summarize
from app.schemas import EvaluationRequest, PredictionRequest, SimulationRequest
from app.simulation import simulate_tournament

app = FastAPI(title="World Cup Intelligence Model Service", version="0.1.0")


@app.get("/internal/v1/health")
def health() -> dict:
    return {"status": "ok", "service": "wci-model-service", "version": "0.1.0"}


@app.post("/internal/v1/predict")
def predict(request: PredictionRequest) -> dict:
    home_xg = max(0.2, request.home.attack / request.away.defense + request.home.lineup_adjustment)
    away_xg = max(0.2, request.away.attack / request.home.defense + request.away.lineup_adjustment)
    home_advantage = 0.0 if request.neutral else 65.0
    elo = outcome_probabilities(request.home.elo, request.away.elo, home_advantage)
    matrix = score_matrix(home_xg, away_xg, request.max_goals)
    score_summary = summarize(matrix)
    poisson = [float(score_summary["home"]), float(score_summary["draw"]), float(score_summary["away"])]
    market = [request.market.home, request.market.draw, request.market.away] if request.market else poisson
    ensemble = weighted_pool([elo, poisson, market], [0.28, 0.44, 0.28])
    return {
        "match_id": request.match_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        **ensemble,
        "home_xg": home_xg,
        "away_xg": away_xg,
        "scorelines": score_summary["scorelines"],
        "over_25": score_summary["over25"],
        "both_teams_score": score_summary["both_teams_score"],
        "models": [
            {"model": "Elo", "home": elo[0], "draw": elo[1], "away": elo[2]},
            {"model": "Dixon-Coles", "home": poisson[0], "draw": poisson[1], "away": poisson[2]},
            {"model": "Market consensus", "home": market[0], "draw": market[1], "away": market[2]},
            {"model": "Ensemble", **ensemble},
        ],
        "confidence": 0.7,
        "explanation": {
            "elo_difference": request.home.elo - request.away.elo,
            "rest_difference": request.home.rest_days - request.away.rest_days,
            "travel_difference": request.away.travel_km - request.home.travel_km,
        },
    }


@app.post("/internal/v1/simulate")
def simulate(request: SimulationRequest) -> dict:
    result = simulate_tournament(request.teams, request.iterations, request.seed)
    return {"status": "completed", "iterations": request.iterations, "seed": request.seed, "teams": result}


@app.post("/internal/v1/evaluate")
def evaluate(request: EvaluationRequest) -> dict:
    if len(request.probabilities) != len(request.outcomes):
        return {"status": "invalid", "message": "probabilities and outcomes must have equal length"}
    return {
        "status": "completed",
        "sample_size": len(request.outcomes),
        "log_loss": log_loss(request.probabilities, request.outcomes),
        "brier": brier_score(request.probabilities, request.outcomes),
        "rps": ranked_probability_score(request.probabilities, request.outcomes),
    }
