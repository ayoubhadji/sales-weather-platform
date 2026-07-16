import json
from datetime import datetime, timezone

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

from .config import MODELS_DIR, MIN_SAMPLES_TO_TRAIN, WEATHER_CONDITIONS, PRODUCT_CATEGORIES
from .data_loader import fetch_revenue_training_data, fetch_demand_training_data

REVENUE_MODEL_PATH = MODELS_DIR / "revenue_models.pkl"
REVENUE_META_PATH = MODELS_DIR / "revenue_meta.json"
DEMAND_MODEL_PATH = MODELS_DIR / "demand_models.pkl"
DEMAND_META_PATH = MODELS_DIR / "demand_meta.json"


# --------------------------------------------------------------------------
# Feature building — shared logic to keep train-time and predict-time
# columns perfectly aligned.
# --------------------------------------------------------------------------

def _weather_dummies(df: pd.DataFrame) -> pd.DataFrame:
    dummies = pd.get_dummies(df["weatherCondition"], prefix="cond")
    for cond in WEATHER_CONDITIONS:
        col = f"cond_{cond}"
        if col not in dummies.columns:
            dummies[col] = 0
    return dummies[[f"cond_{c}" for c in WEATHER_CONDITIONS]]


def build_revenue_features(df: pd.DataFrame) -> pd.DataFrame:
    base = df[["temperature", "humidity", "rainfall", "windSpeed"]].astype(float)
    return pd.concat([base.reset_index(drop=True), _weather_dummies(df).reset_index(drop=True)], axis=1)


def build_demand_features(df: pd.DataFrame, known_product_ids: list[int]) -> pd.DataFrame:
    base = df[["temperature", "humidity", "rainfall", "windSpeed"]].astype(float)
    weather = _weather_dummies(df).reset_index(drop=True)

    category_dummies = pd.get_dummies(df["category"], prefix="cat")
    for cat in PRODUCT_CATEGORIES:
        col = f"cat_{cat}"
        if col not in category_dummies.columns:
            category_dummies[col] = 0
    category_dummies = category_dummies[[f"cat_{c}" for c in PRODUCT_CATEGORIES]].reset_index(drop=True)

    # One column per known product. Unseen products at prediction time simply
    # get all zeros — the model falls back to category + weather signal only.
    product_dummies = pd.get_dummies(df["productId"], prefix="product")
    for pid in known_product_ids:
        col = f"product_{pid}"
        if col not in product_dummies.columns:
            product_dummies[col] = 0
    product_dummies = product_dummies[[f"product_{pid}" for pid in known_product_ids]].reset_index(drop=True)

    return pd.concat([base.reset_index(drop=True), weather, category_dummies, product_dummies], axis=1)


# --------------------------------------------------------------------------
# Training
# --------------------------------------------------------------------------

def _fit_and_score(X: pd.DataFrame, y: pd.Series, model_class):
    model = model_class()
    model.fit(X, y)
    predictions = model.predict(X)
    return {
        "model": model,
        # NOTE: these are in-sample metrics (fit on the same data used to
        # train), not held-out validation — with this little data a proper
        # train/test split would leave almost nothing to test on. Treat
        # these as "fit quality", not generalization accuracy.
        "r2": round(float(r2_score(y, predictions)), 4),
        "mae": round(float(mean_absolute_error(y, predictions)), 2),
    }


def train_revenue_models() -> dict:
    df = fetch_revenue_training_data()

    if len(df) < MIN_SAMPLES_TO_TRAIN:
        return {
            "status": "not_enough_data",
            "samplesFound": len(df),
            "samplesRequired": MIN_SAMPLES_TO_TRAIN,
        }

    X = build_revenue_features(df)
    y_revenue = df["totalRevenue"].astype(float)
    y_tickets = df["ticketCount"].astype(float)

    results = {
        "revenue": {
            "linear_regression": _fit_and_score(X, y_revenue, LinearRegression),
            "random_forest": _fit_and_score(
                X, y_revenue, lambda: RandomForestRegressor(n_estimators=100, random_state=42)
            ),
        },
        "tickets": {
            "linear_regression": _fit_and_score(X, y_tickets, LinearRegression),
            "random_forest": _fit_and_score(
                X, y_tickets, lambda: RandomForestRegressor(n_estimators=100, random_state=42)
            ),
        },
    }

    joblib.dump(
        {
            "revenue_linear": results["revenue"]["linear_regression"]["model"],
            "revenue_forest": results["revenue"]["random_forest"]["model"],
            "tickets_linear": results["tickets"]["linear_regression"]["model"],
            "tickets_forest": results["tickets"]["random_forest"]["model"],
        },
        REVENUE_MODEL_PATH,
    )

    metadata = {
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "samplesUsed": len(df),
        "metrics": {
            "revenue": {
                "linear_regression": {"r2": results["revenue"]["linear_regression"]["r2"], "mae": results["revenue"]["linear_regression"]["mae"]},
                "random_forest": {"r2": results["revenue"]["random_forest"]["r2"], "mae": results["revenue"]["random_forest"]["mae"]},
            },
            "tickets": {
                "linear_regression": {"r2": results["tickets"]["linear_regression"]["r2"], "mae": results["tickets"]["linear_regression"]["mae"]},
                "random_forest": {"r2": results["tickets"]["random_forest"]["r2"], "mae": results["tickets"]["random_forest"]["mae"]},
            },
        },
    }
    REVENUE_META_PATH.write_text(json.dumps(metadata, indent=2))

    return {"status": "trained", **metadata}


def train_demand_models() -> dict:
    df = fetch_demand_training_data()

    if len(df) < MIN_SAMPLES_TO_TRAIN:
        return {
            "status": "not_enough_data",
            "samplesFound": len(df),
            "samplesRequired": MIN_SAMPLES_TO_TRAIN,
        }

    known_product_ids = sorted(df["productId"].unique().tolist())
    X = build_demand_features(df, known_product_ids)
    y = df["quantitySold"].astype(float)

    linear_result = _fit_and_score(X, y, LinearRegression)
    forest_result = _fit_and_score(X, y, lambda: RandomForestRegressor(n_estimators=100, random_state=42))

    joblib.dump(
        {"linear": linear_result["model"], "forest": forest_result["model"]},
        DEMAND_MODEL_PATH,
    )

    metadata = {
        "trainedAt": datetime.now(timezone.utc).isoformat(),
        "samplesUsed": len(df),
        "knownProductIds": known_product_ids,
        "metrics": {
            "linear_regression": {"r2": linear_result["r2"], "mae": linear_result["mae"]},
            "random_forest": {"r2": forest_result["r2"], "mae": forest_result["mae"]},
        },
    }
    DEMAND_META_PATH.write_text(json.dumps(metadata, indent=2))

    return {"status": "trained", **metadata}


def train_all() -> dict:
    return {
        "revenue": train_revenue_models(),
        "demand": train_demand_models(),
    }


# --------------------------------------------------------------------------
# Prediction
# --------------------------------------------------------------------------

def _confidence_from_samples(samples_used: int) -> float:
    # Same spirit as the NestJS heuristic's confidence scale: honest, capped,
    # grows slowly with more historical data.
    return min(30 + samples_used * 2, 85)


def _pick_recommended(metrics_a: dict, metrics_b: dict, key_a: str, key_b: str) -> str:
    # Lower MAE wins. With very few samples this is a soft signal, not proof.
    return key_a if metrics_a["mae"] <= metrics_b["mae"] else key_b


def predict_revenue(features: dict) -> dict:
    if not REVENUE_MODEL_PATH.exists() or not REVENUE_META_PATH.exists():
        return {"status": "not_trained"}

    models = joblib.load(REVENUE_MODEL_PATH)
    meta = json.loads(REVENUE_META_PATH.read_text())

    row = pd.DataFrame([features])
    X = build_revenue_features(row)

    revenue_linear = float(models["revenue_linear"].predict(X)[0])
    revenue_forest = float(models["revenue_forest"].predict(X)[0])
    tickets_linear = float(models["tickets_linear"].predict(X)[0])
    tickets_forest = float(models["tickets_forest"].predict(X)[0])

    recommended = _pick_recommended(
        meta["metrics"]["revenue"]["linear_regression"],
        meta["metrics"]["revenue"]["random_forest"],
        "linear_regression",
        "random_forest",
    )
    recommended_revenue = revenue_linear if recommended == "linear_regression" else revenue_forest
    recommended_tickets = tickets_linear if recommended == "linear_regression" else tickets_forest

    return {
        "status": "ok",
        "predictedRevenue": round(max(0, recommended_revenue), 2),
        "predictedTickets": round(max(0, recommended_tickets)),
        "recommendedModel": recommended,
        "predictions": {
            "linear_regression": {"revenue": round(revenue_linear, 2), "tickets": round(tickets_linear)},
            "random_forest": {"revenue": round(revenue_forest, 2), "tickets": round(tickets_forest)},
        },
        "confidence": _confidence_from_samples(meta["samplesUsed"]),
        "samplesUsedForTraining": meta["samplesUsed"],
    }


def predict_demand(features: dict) -> dict:
    if not DEMAND_MODEL_PATH.exists() or not DEMAND_META_PATH.exists():
        return {"status": "not_trained"}

    models = joblib.load(DEMAND_MODEL_PATH)
    meta = json.loads(DEMAND_META_PATH.read_text())

    row = pd.DataFrame([features])
    X = build_demand_features(row, meta["knownProductIds"])

    linear_pred = float(models["linear"].predict(X)[0])
    forest_pred = float(models["forest"].predict(X)[0])

    recommended = _pick_recommended(
        meta["metrics"]["linear_regression"],
        meta["metrics"]["random_forest"],
        "linear_regression",
        "random_forest",
    )
    recommended_value = linear_pred if recommended == "linear_regression" else forest_pred

    return {
        "status": "ok",
        "predictedQuantity": round(max(0, recommended_value)),
        "recommendedModel": recommended,
        "predictions": {
            "linear_regression": round(linear_pred, 2),
            "random_forest": round(forest_pred, 2),
        },
        "confidence": _confidence_from_samples(meta["samplesUsed"]),
        "samplesUsedForTraining": meta["samplesUsed"],
    }