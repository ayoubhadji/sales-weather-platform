# 🤖 Sales Weather Platform - Machine Learning Service

## 📌 Overview

The **Machine Learning Service** is an independent microservice built with **FastAPI** and **Scikit-learn**. It is responsible for training and serving predictive models used by the **Sales Weather Platform**.

The service communicates with the NestJS backend to retrieve historical sales and weather data, trains multiple regression models, and generates predictions for business metrics.

Unlike the heuristic prediction implemented in the backend, this service relies on Machine Learning models trained from historical data.

---

# 🚀 Features

- 📈 Revenue prediction
- 🎫 Ticket count prediction
- 🍔 Product demand prediction
- 🧠 Automatic model training
- 📊 Model performance evaluation
- 🌲 Linear Regression & Random Forest comparison
- 💾 Automatic model persistence using Joblib
- 🔄 REST API integration with NestJS
- 🐳 Docker support

---

# 🛠 Tech Stack

- Python 3
- FastAPI
- Scikit-learn
- Pandas
- NumPy
- Joblib
- Uvicorn

---

# 📂 Project Structure

```text
ml-service/
│
├── app/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── schemas/
│   ├── utils/
│   └── main.py
│
├── models/
│
├── requirements.txt
├── Dockerfile
└── README.md
```

---

# ⚙️ Installation

Clone the project and navigate to the ML service.

```bash
cd ml-service
```

Create a virtual environment.

```bash
python -m venv venv
```

Activate it.

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

---

# ▶️ Running the Service

The NestJS backend must be running before starting the ML service.

```bash
uvicorn app.main:app --reload --port 8000
```

Service URL

```
http://localhost:8000
```

Swagger Documentation

```
http://localhost:8000/docs
```

---

# 🐳 Docker

The ML service is fully containerized.

Build the image.

```bash
docker build -t ml-service .
```

Run the container.

```bash
docker run -p 8000:8000 ml-service
```

When using Docker Compose, the service starts automatically with the rest of the platform.

---

# 🔗 Backend Communication

The ML service retrieves its training data directly from the NestJS backend.

Training endpoints:

```
GET /predictions/training-data/revenue
GET /predictions/training-data/demand
```

Prediction results are returned to the backend, which exposes them to the frontend.

---

# 📡 API Endpoints

## GET /health

Checks whether the service is running.

---

## POST /train

Triggers the complete training pipeline.

The endpoint:

- Downloads historical data
- Preprocesses datasets
- Trains all models
- Evaluates model performance
- Saves trained models
- Stores model metadata

Returned information includes:

- Revenue models
- Ticket models
- Demand models
- Mean Absolute Error (MAE)
- Recommended model for each prediction task

If fewer than **5 training samples** are available, the service returns:

```json
{
  "status": "not_enough_data"
}
```

---

## POST /predict/revenue

Predicts:

- Daily revenue
- Expected ticket count

Example request:

```json
{
  "temperature": 32,
  "humidity": 45,
  "rainfall": 0,
  "windSpeed": 12,
  "weatherCondition": "SUNNY"
}
```

If no trained models are available, the service returns:

```json
{
  "status": "not_trained"
}
```

---

## POST /predict/demand

Predicts the expected demand for a product.

Example request:

```json
{
  "temperature": 32,
  "humidity": 45,
  "rainfall": 0,
  "windSpeed": 12,
  "weatherCondition": "SUNNY",
  "productId": 5,
  "category": "COLD_DRINK",
  "productName": "Ice Cream"
}
```

---

# 🧠 Machine Learning Pipeline

```text
Historical Data
        │
        ▼
Data Preprocessing
        │
        ▼
Model Training
        │
        ▼
Model Evaluation
        │
        ▼
Model Persistence
        │
        ▼
Prediction
```

---

# 🤖 Trained Models

For each prediction task, the service trains two regression algorithms.

## Revenue Prediction

- Linear Regression
- Random Forest Regressor

---

## Ticket Prediction

- Linear Regression
- Random Forest Regressor

---

## Product Demand Prediction

- Linear Regression
- Random Forest Regressor

After training, the service compares each pair of models using **Mean Absolute Error (MAE)** and automatically recommends the most accurate one.

---

# 💾 Model Persistence

Trained models are stored inside the `models/` directory.

Example:

```text
models/
│
├── revenue_linear.pkl
├── revenue_random_forest.pkl
├── ticket_linear.pkl
├── ticket_random_forest.pkl
├── demand_linear.pkl
└── demand_random_forest.pkl
```

Models are automatically regenerated whenever the `/train` endpoint is executed.

Model files are excluded from version control through `.gitignore`.

---

# 🔧 Environment Variables

```env
NESTJS_BASE_URL=http://localhost:3000
```

When running with Docker Compose:

```env
NESTJS_BASE_URL=http://backend:3000
```

---

# ⚠️ Notes

- Model performance metrics are currently computed using the **same dataset used for training**. With the limited amount of historical data currently available, creating a dedicated train/test split would significantly reduce the training dataset.
- Reported metrics should therefore be interpreted as indicators of **model fit**, not as measures of real-world generalization.
- As more sales history becomes available, the training pipeline can be extended with train/test splits, cross-validation, and more advanced evaluation techniques.

---

# 🚀 Future Improvements

- XGBoost
- LightGBM
- Cross-validation
- Hyperparameter tuning
- Time-series forecasting
- Automated retraining
- Explainable AI (SHAP)
- Model versioning
- Deep Learning models

---

# 👨‍💻 Author

Developed as part of the **Sales Weather Platform**, integrating **FastAPI**, **Scikit-learn**, and **Machine Learning** into a modern microservices architecture for intelligent sales prediction.