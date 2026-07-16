import os
from pathlib import Path

# Base URL of the NestJS backend, where training data is fetched from.
NESTJS_BASE_URL = os.getenv("NESTJS_BASE_URL", "http://localhost:3000")

# Where trained models + metadata are stored on disk.
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

# Below this number of historical days/rows, we don't bother training —
# there simply isn't enough signal yet.
MIN_SAMPLES_TO_TRAIN = 5

# Fixed category lists so one-hot encoding produces the same columns at
# training time and at prediction time, no matter what subset of values
# happens to be present in a given batch of data.
WEATHER_CONDITIONS = ["SUNNY", "CLOUDY", "RAINY", "STORM", "FOG"]
PRODUCT_CATEGORIES = ["FOOD", "FAST_FOOD", "HOT_DRINK", "COLD_DRINK", "DESSERT", "SNACK"]