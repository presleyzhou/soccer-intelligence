from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field, model_validator


class TeamFeatures(BaseModel):
    team_id: str
    elo: float
    attack: float = Field(gt=0)
    defense: float = Field(gt=0)
    recent_form: float = 0.0
    rest_days: float = 5.0
    travel_km: float = 0.0
    lineup_adjustment: float = 0.0


class MarketProbabilities(BaseModel):
    home: float
    draw: float
    away: float

    @model_validator(mode="after")
    def validate_probability_sum(self) -> "MarketProbabilities":
        total = self.home + self.draw + self.away
        if min(self.home, self.draw, self.away) < 0 or abs(total - 1.0) > 1e-6:
            raise ValueError("Market probabilities must be non-negative and sum to one")
        return self


class PredictionRequest(BaseModel):
    match_id: str
    cutoff_at: str
    home: TeamFeatures
    away: TeamFeatures
    neutral: bool = True
    market: Optional[MarketProbabilities] = None
    max_goals: int = Field(default=8, ge=5, le=12)


class Scoreline(BaseModel):
    home: int
    away: int
    probability: float


class ModelResult(BaseModel):
    model: str
    home: float
    draw: float
    away: float


class PredictionResponse(BaseModel):
    match_id: str
    generated_at: str
    home: float
    draw: float
    away: float
    home_xg: float
    away_xg: float
    both_teams_score: float
    over_25: float
    scorelines: List[Scoreline]
    models: List[ModelResult]
    confidence: float
    explanation: Dict[str, float]


class SimulationTeam(BaseModel):
    team_id: str
    group: str
    strength: float


class SimulationRequest(BaseModel):
    teams: List[SimulationTeam]
    iterations: int = Field(default=50_000, ge=1_000, le=500_000)
    seed: int = 20260612


class TeamSimulationResult(BaseModel):
    team_id: str
    round_of_32: float
    round_of_16: float
    quarter_final: float
    semi_final: float
    final: float
    champion: float


class SimulationResponse(BaseModel):
    iterations: int
    seed: int
    teams: List[TeamSimulationResult]


class EvaluationRequest(BaseModel):
    probabilities: List[List[float]]
    outcomes: List[int]


class EvaluationResponse(BaseModel):
    log_loss: float
    brier: float
    rps: float
    accuracy: float
    sample_size: int
