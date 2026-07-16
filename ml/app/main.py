from fastapi import FastAPI

from .schemas import WeatherFeatures, DemandFeatures
from . import model_service

app = FastAPI(title="Sales Weather ML Service", version="0.1.0")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/train")
def train():
    """
    Re-trains both Linear Regression and Random Forest models for the
    revenue model and the demand model, using the latest data pulled from
    the NestJS backend. Call this whenever the database has grown
    (e.g. from a daily cron job in NestJS).
    """
    return model_service.train_all()


@app.post("/predict/revenue")
def predict_revenue(features: WeatherFeatures):
    """
    Predicts tomorrow's total revenue + ticket count from weather features.
    Returns status "not_trained" if /train has never succeeded yet — the
    caller (NestJS) should fall back to the heuristic in that case.
    """
    return model_service.predict_revenue(features.model_dump())


@app.post("/predict/demand")
def predict_demand(features: DemandFeatures):
    """
    Predicts tomorrow's demand (quantity) for a single product from its
    category + weather features. Same "not_trained" fallback rule applies.
    """
    return model_service.predict_demand(features.model_dump())