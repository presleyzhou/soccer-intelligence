from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class MatchFeatures(BaseModel):
    home_team_id: str
    away_team_id: str
    home_elo: float
    away_elo: float
    home_xg: float = Field(gt=0, le=6)
    away_xg: float = Field(gt=0, le=6)
    home_advantage: float = 0.0
    market_probabilities: Optional[List[float]] = None


class PredictionRequest(BaseModel):
    features: MatchFeatures
    model_version: str = "wci-ensemble-0.1.0"


class SimulationRequest(BaseModel):
    team_ids: List[str]
    strengths: Dict[str, float]
    iterations: int = Field(default=50000, ge=1000, le=500000)
    seed: int = 20260612


class EvaluationRequest(BaseModel):
    probabilities: List[List[float]]
    outcomes: List[int]
