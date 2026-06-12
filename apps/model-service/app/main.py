from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, Header, HTTPException

from .evaluation import evaluate
from .models.elo import result_probabilities
from .models.ensemble import weighted_pool
from .models.poisson import aggregate_1x2, both_teams_score, expected_goals, over_25, score_matrix, top_scorelines
from .schemas import (
    EvaluationRequest,
    EvaluationResponse,
    ModelResult,
    PredictionRequest,
    PredictionResponse,
    Scoreline,
    SimulationRequest,
    SimulationResponse,
    TeamSimulationResult,
)
from .simulation import simulate_tournament


app = FastAPI(title="World Cup Intelligence Model Service", version="0.1.0")


def _authorize(token: Optional[str]) -> None:
    import os

    expected = os.getenv("MODEL_SERVICE_TOKEN")
    if expected and token != expected:
        raise HTTPException(status_code=401, detail="Invalid model service token")


@app.get("/internal/v1/health")
def health() -> dict:
    return {"status": "ok", "service": "wci-model", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/internal/v1/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest, x_model_token: Optional[str] = Header(default=None)) -> PredictionResponse:
    _authorize(x_model_token)
    home_xg, away_xg = expected_goals(
        request.home.attack,
        request.home.defense,
        request.away.attack,
        request.away.defense,
        request.neutral,
        request.home.lineup_adjustment,
        request.away.lineup_adjustment,
    )
    matrix = score_matrix(home_xg, away_xg, request.max_goals)
    poisson_probabilities = aggregate_1x2(matrix)
    elo_probabilities = result_probabilities(request.home.elo, request.away.elo, request.neutral)
    predictions = [elo_probabilities, poisson_probabilities]
    weights = [0.35, 0.45]
    model_results = [
        ModelResult(model="Elo", home=elo_probabilities[0], draw=elo_probabilities[1], away=elo_probabilities[2]),
        ModelResult(model="Dixon-Coles", home=poisson_probabilities[0], draw=poisson_probabilities[1], away=poisson_probabilities[2]),
    ]
    if request.market:
        market = (request.market.home, request.market.draw, request.market.away)
        predictions.append(market)
        weights.append(0.20)
        model_results.append(ModelResult(model="Market consensus", home=market[0], draw=market[1], away=market[2]))
    home, draw, away = weighted_pool(predictions, weights)
    model_results.append(ModelResult(model="Ensemble", home=home, draw=draw, away=away))
    disagreement = max(
        max(row[index] for row in predictions) - min(row[index] for row in predictions)
        for index in range(3)
    )
    confidence = max(0.25, min(0.92, 0.84 - disagreement))
    return PredictionResponse(
        match_id=request.match_id,
        generated_at=datetime.now(timezone.utc).isoformat(),
        home=home,
        draw=draw,
        away=away,
        home_xg=home_xg,
        away_xg=away_xg,
        both_teams_score=both_teams_score(matrix),
        over_25=over_25(matrix),
        scorelines=[Scoreline(home=h, away=a, probability=p) for h, a, p in top_scorelines(matrix)],
        models=model_results,
        confidence=confidence,
        explanation={
            "elo_gap": (request.home.elo - request.away.elo) / 400.0,
            "attack_gap": request.home.attack - request.away.attack,
            "rest_gap": request.home.rest_days - request.away.rest_days,
            "travel_gap_thousand_km": (request.away.travel_km - request.home.travel_km) / 1000.0,
            "model_disagreement": disagreement,
        },
    )


@app.post("/internal/v1/simulate", response_model=SimulationResponse)
def simulate(request: SimulationRequest, x_model_token: Optional[str] = Header(default=None)) -> SimulationResponse:
    _authorize(x_model_token)
    results = simulate_tournament(request.teams, request.iterations, request.seed)
    return SimulationResponse(
        iterations=request.iterations,
        seed=request.seed,
        teams=[
            TeamSimulationResult(team_id=team.team_id, **results[team.team_id])
            for team in request.teams
        ],
    )


@app.post("/internal/v1/evaluate", response_model=EvaluationResponse)
def evaluate_predictions(request: EvaluationRequest, x_model_token: Optional[str] = Header(default=None)) -> EvaluationResponse:
    _authorize(x_model_token)
    result = evaluate(request.probabilities, request.outcomes)
    return EvaluationResponse(**result)
