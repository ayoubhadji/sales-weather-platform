import requests
import pandas as pd
from .config import NESTJS_BASE_URL


def fetch_revenue_training_data() -> pd.DataFrame:
    response = requests.get(f"{NESTJS_BASE_URL}/predictions/training-data/revenue", timeout=10)
    response.raise_for_status()
    return pd.DataFrame(response.json())


def fetch_demand_training_data() -> pd.DataFrame:
    response = requests.get(f"{NESTJS_BASE_URL}/predictions/training-data/demand", timeout=10)
    response.raise_for_status()
    return pd.DataFrame(response.json())