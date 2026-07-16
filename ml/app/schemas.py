from pydantic import BaseModel
from typing import Optional, Literal


class WeatherFeatures(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    windSpeed: float
    weatherCondition: Literal["SUNNY", "CLOUDY", "RAINY", "STORM", "FOG"]


class DemandFeatures(WeatherFeatures):
    productId: int
    category: Literal["FOOD", "FAST_FOOD", "HOT_DRINK", "COLD_DRINK", "DESSERT", "SNACK"]
    productName: Optional[str] = None


class ModelPrediction(BaseModel):
    value: float
    modelType: Literal["linear_regression", "random_forest"]


class RevenuePredictionResponse(BaseModel):
    status: Literal["ok", "not_trained"]
    predictedRevenue: Optional[float] = None
    predictedTickets: Optional[float] = None
    recommendedModel: Optional[Literal["linear_regression", "random_forest"]] = None
    predictions: Optional[dict] = None
    confidence: Optional[float] = None
    samplesUsedForTraining: Optional[int] = None


class DemandPredictionResponse(BaseModel):
    status: Literal["ok", "not_trained"]
    predictedQuantity: Optional[float] = None
    recommendedModel: Optional[Literal["linear_regression", "random_forest"]] = None
    predictions: Optional[dict] = None
    confidence: Optional[float] = None
    samplesUsedForTraining: Optional[int] = None