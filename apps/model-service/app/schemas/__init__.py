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
    def validate_sum(self) -> "MarketProbabilities":
        if min(self.home, self.draw, self.away) < 0 or abs(self.home + self.draw + self.away - 1.0) > 1e-6:
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


class SimulationTeam(BaseModel):
    team_id: str
    group: str
    strength: float


class SimulationRequest(BaseModel):
    teams: List[SimulationTeam]
    iterations: int = Field(default=50_000, ge=1_000, le=500_000)
    seed: int = 20260612


class EvaluationRequest(BaseModel):
    probabilities: List[List[float]]
    outcomes: List[int]
