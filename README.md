# 🌤️ Sales Weather Prediction Platform

## 📌 Overview

The **Sales Weather Prediction Platform** is an intelligent full-stack web application designed to help restaurant franchises improve their daily operations by combining **sales management**, **weather analysis**, and **machine learning predictions**.

The platform allows administrators to manage products, franchises, promotions, weather conditions, and sales while providing franchise owners with an intuitive interface to manage daily restaurant activities.

Unlike traditional restaurant management systems, the platform integrates **weather data** with historical sales information to predict:

- 📈 Daily revenue
- 🎫 Expected ticket count
- 🍕 Product demand
- ⚠️ Business alerts
- 🎯 Promotional opportunities

The application follows a **microservices architecture** and consists of four main services:

- 🖥️ React Frontend
- ⚙️ NestJS Backend
- 🤖 FastAPI Machine Learning Service
- 🐘 PostgreSQL Database

All services are fully containerized using **Docker** and orchestrated with **Docker Compose**.

---

# 🚀 Key Features

## 👨‍💼 Administrator

The administrator dashboard provides complete control over the platform.

### Dashboard

- Business overview
- Sales statistics
- Revenue monitoring
- Weather overview
- Franchise performance

---

### Product Management

- Create products
- Edit products
- Delete products
- Upload product images
- Product categorization
- Price management

---

### Franchise Management

- Create franchises
- Activate / Deactivate franchises
- Monitor franchise activity
- Sales statistics

---

### Weather Management

- Import weather data
- View historical weather
- Weather analytics

---

### Promotions

- Create promotions
- Discount management
- Promotion scheduling

---

### Alerts

- Weather alerts
- Business alerts
- Revenue alerts
- System notifications

---

### Sales Analytics

- Daily sales
- Revenue history
- Ticket history
- Product performance

---

## 🏪 Franchise

Each franchise has its own dedicated workspace.

### Dashboard

- Daily overview
- Current weather
- Quick statistics

---

### Product Menu

- Browse products
- Search products
- Product categories
- Product images

---

### Shopping Cart

- Add products
- Remove products
- Quantity management
- Automatic total calculation

---

### Ticket Management

- Create sales tickets
- View ticket history
- Detailed ticket information

---

### Weather Dashboard

- Current weather
- Weather conditions
- Operational assistance

---

## 🤖 Machine Learning

The platform integrates an independent **FastAPI Machine Learning microservice** capable of training and serving predictive models.

Current prediction capabilities include:

### Revenue Prediction

Predicts:

- Expected daily revenue
- Expected ticket count

using:

- Weather conditions
- Temperature
- Humidity
- Rainfall
- Wind speed

---

### Product Demand Prediction

Predicts the expected quantity sold for each product using:

- Weather conditions
- Product category
- Product information
- Historical sales

---

### Multiple Prediction Models

The ML service automatically trains and compares:

- 📊 Linear Regression
- 🌲 Random Forest Regression

The platform automatically recommends the model with the lowest prediction error.

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- React Router DOM
- Axios
- Context API
- Lucide React

---

## Backend

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- JWT Authentication
- Multer
- Class Validator
- Swagger

---

## Machine Learning

- FastAPI
- Python
- Scikit-learn
- Pandas
- Joblib
- Uvicorn

Machine Learning Models:

- Linear Regression
- Random Forest Regressor

---

## Database

- PostgreSQL

---

## DevOps

- Docker
- Docker Compose
- Git
- GitHub
- CI/CD

---

# 🏗 System Architecture

```text
                         ┌─────────────────────┐
                         │     React Frontend  │
                         │     (Vite + TS)     │
                         └──────────┬──────────┘
                                    │
                           REST API │
                                    ▼
                      ┌─────────────────────────┐
                      │     NestJS Backend      │
                      │  Business Logic & APIs  │
                      └───────┬────────┬────────┘
                              │        │
                 PostgreSQL   │        │ HTTP
                              │        ▼
                              │  ┌──────────────────┐
                              │  │ FastAPI ML       │
                              │  │ Prediction Engine│
                              │  └──────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ PostgreSQL Database │
                    └─────────────────────┘
```

---

# 🐳 Containerized Architecture

The complete platform is fully containerized.

```text
Docker Compose
│
├── Frontend Container
│       React + Vite
│
├── Backend Container
│       NestJS
│
├── ML Container
│       FastAPI
│
└── PostgreSQL Container
```

Each service communicates through Docker's internal network, making the platform portable and easy to deploy.
# 📂 Project Structure

The repository is organized using a modular architecture that separates each application layer into its own directory.

```text
sales-weather-platform/
│
├── frontend/                 # React Application
│
├── backend/
│   └── api/                  # NestJS Backend
│
├── ml-service/               # FastAPI Machine Learning Service
│
├── docker-compose.yml
│
├── .github/
│   └── workflows/            # CI/CD Pipelines
│
└── README.md
```

---

# 📦 Project Components

The platform is composed of four independent services.

| Service | Technology | Description |
|----------|------------|-------------|
| 🌐 Frontend | React + TypeScript + Vite | User Interface |
| ⚙️ Backend | NestJS | REST API & Business Logic |
| 🤖 Machine Learning | FastAPI + Scikit-learn | AI Prediction Service |
| 🐘 Database | PostgreSQL | Data Storage |

---

# ⚙️ Prerequisites

Before running the application, ensure the following software is installed:

- Node.js (v20 or later)
- Python (v3.12 or later)
- PostgreSQL (if running locally)
- Docker
- Docker Compose
- Git

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/sales-weather-platform.git

cd sales-weather-platform
```

---

## 2. Install Frontend Dependencies

```bash
cd frontend

npm install
```

---

## 3. Install Backend Dependencies

```bash
cd ../backend/api

npm install
```

---

## 4. Install Machine Learning Dependencies

```bash
cd ../../ml-service

pip install -r requirements.txt
```

---

# ▶️ Running the Platform (Development)

The application can be started by running each service individually.

## Start PostgreSQL

Make sure PostgreSQL is running locally.

---

## Start Backend

```bash
cd backend/api

npm run start:dev
```

Backend URL

```
http://localhost:3000
```

---

## Start Machine Learning Service

```bash
cd ml-service

uvicorn app.main:app --reload
```

ML Service URL

```
http://localhost:8000
```

---

## Start Frontend

```bash
cd frontend

npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 🐳 Running with Docker

The recommended way to run the application is using Docker Compose.

From the project root:

```bash
docker compose up --build
```

The first build may take several minutes depending on your internet connection.

---

## Running in Background

```bash
docker compose up -d
```

---

## Stop the Platform

```bash
docker compose down
```

---

## Rebuild Containers

If source code changes require rebuilding the images:

```bash
docker compose up --build
```

---

# 🐳 Docker Services

The Docker Compose configuration starts four containers automatically.

| Container | Port | Description |
|-----------|------|-------------|
| frontend | 5173 | React Application |
| backend | 3000 | NestJS REST API |
| ml | 8000 | FastAPI Prediction Service |
| postgres | 5432 | PostgreSQL Database |

---

# 🌐 Service Communication

The services communicate through Docker's internal network.

```text
Frontend
     │
     ▼
Backend
  │      │
  ▼      ▼
Database  ML Service
```

Communication flow:

- Frontend → Backend (REST API)
- Backend → PostgreSQL
- Backend → FastAPI ML Service
- ML Service → Backend Training Endpoints

---

# 🔧 Environment Variables

Each service uses its own `.env` configuration file.

---

## Frontend

```env
VITE_API_URL=http://localhost:3000
```

---

## Backend

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=sales_weather_db

JWT_SECRET=your_secret_key

PYTHON_ML_URL=http://localhost:8000
```

When running with Docker, the ML URL is automatically replaced by:

```env
PYTHON_ML_URL=http://ml:8000
```

---

## Machine Learning Service

```env
NESTJS_BASE_URL=http://localhost:3000
```

Inside Docker:

```env
NESTJS_BASE_URL=http://backend:3000
```

---

# 📁 File Storage

Product images uploaded through the administrator dashboard are stored inside the backend.

```text
backend/api/uploads/products/
```

Docker mounts this directory as a persistent volume, ensuring uploaded images remain available even if containers are restarted.

---

# 🔒 Authentication

The platform uses JWT authentication.

Authentication workflow:

```text
Login
   │
   ▼
Backend validates credentials
   │
   ▼
JWT Token generated
   │
   ▼
Stored in browser
   │
   ▼
Automatically attached to protected requests
```

Protected resources can only be accessed by authenticated users based on their assigned role.

---

# 📚 API Documentation

The backend exposes interactive API documentation through Swagger.

Once the backend is running, it is available at:

```
http://localhost:3000/api
```

Swagger allows developers to:

- Explore all endpoints
- Test requests
- View request/response schemas
- Authenticate using JWT
- Debug API interactions

# 👨‍💼 Administrator Module

The Administrator Dashboard provides complete control over the platform, allowing administrators to manage products, franchises, weather information, promotions, alerts, and business analytics from a centralized interface.

---

## 📊 Dashboard

The administrator dashboard provides an overview of the platform's activity through key performance indicators.

Features include:

- Total revenue
- Total sales
- Number of franchises
- Number of products
- Weather summary
- Recent sales
- Recent alerts
- Platform statistics

---

## 🍔 Product Management

Administrators can manage the complete product catalog available to all franchises.

### Features

- View all products
- Search products
- Filter by category
- Create new products
- Update existing products
- Delete products
- Upload product images

Each product contains:

- Product name
- Category
- Price
- Image
- Creation date

---

## 🏪 Franchise Management

The platform supports multiple restaurant franchises.

Administrators can:

- Create franchises
- Update franchise information
- Activate franchises
- Deactivate franchises
- View franchise statistics
- Monitor franchise activity

---

## 🌦 Weather Management

Weather information is imported and stored to improve prediction accuracy.

Stored weather information includes:

- Date
- Temperature
- Humidity
- Rainfall
- Wind speed
- Weather condition

Supported weather conditions include:

- ☀️ Sunny
- ☁️ Cloudy
- 🌧 Rainy
- 🌫 Fog
- ⛈ Storm

---

## 🎯 Promotions

Administrators can create promotional campaigns to improve sales performance.

Promotion information includes:

- Product
- Discount percentage
- Start date
- End date
- Promotion reason

---

## 🚨 Alerts

The platform automatically stores business alerts.

Examples include:

- Weather alerts
- Revenue alerts
- Promotion alerts
- Prediction alerts
- Business notifications

Alerts help administrators quickly identify important business events.

---

## 📈 Sales Management

Administrators can monitor sales across all franchises.

Features include:

- Sales overview
- Ticket history
- Revenue tracking
- Product performance
- Ticket details

---

# 🏪 Franchise Module

Each franchise has its own workspace designed for daily restaurant operations.

---

## 📊 Dashboard

The franchise dashboard provides quick access to operational information.

Displayed information includes:

- Daily sales
- Weather conditions
- Revenue
- Recent tickets
- Product availability

---

## 🍽 Product Menu

Franchise users can browse the available products.

Features:

- Product cards
- Product images
- Search
- Category filtering
- Product pricing

---

## 🛒 Shopping Cart

The shopping cart allows employees to quickly prepare customer orders.

Capabilities include:

- Add products
- Remove products
- Change quantities
- Automatic subtotal calculation
- Automatic ticket total

---

## 🧾 Sales Tickets

Sales tickets are generated directly from the shopping cart.

Each ticket stores:

- Ticket number
- Sale date
- Ordered products
- Quantities
- Unit prices
- Total amount

---

## 📜 Ticket History

Users can review all previous tickets.

Information includes:

- Ticket number
- Date
- Total
- Ordered items

---

## 🌤 Weather Dashboard

Franchises have access to current weather conditions that may influence customer demand.

Displayed information includes:

- Current temperature
- Humidity
- Rainfall
- Wind speed
- Weather condition

---

# ⚙️ Backend Modules

The backend is developed using **NestJS** following a modular architecture.

Each module encapsulates its own controllers, services, entities, and DTOs.

Current modules include:

```text
Auth
Users
Products
Sales Tickets
Sales Items
Weather
Predictions
Promotions
Alerts
Franchises
```

---

## 🔐 Authentication Module

Responsible for:

- User authentication
- JWT generation
- Login validation
- Role-based authorization

Supported roles:

- Administrator
- Franchise

---

## 📦 Products Module

Handles all product operations.

Capabilities:

- CRUD operations
- Image upload
- Product categories
- Pricing

---

## 🧾 Sales Module

Responsible for managing restaurant sales.

Entities:

- Sales Ticket
- Sales Item

Automatically calculates:

- Item subtotal
- Ticket total

---

## 🌦 Weather Module

Responsible for weather management.

Features:

- Import weather data
- Store weather history
- Retrieve weather records

Weather data is later used by the Machine Learning service.

---

## 🎯 Promotions Module

Manages promotional campaigns.

Features:

- CRUD operations
- Discount validation
- Promotion scheduling

---

## 🚨 Alerts Module

Stores and manages platform alerts.

Alert categories include:

- Weather
- Revenue
- Promotion
- System

---

## 🤖 Predictions Module

Acts as the bridge between NestJS and the Machine Learning service.

Responsibilities:

- Collect training data
- Send prediction requests
- Receive prediction results
- Expose prediction APIs to the frontend

---

# 🐘 Database Design

The platform uses PostgreSQL as its primary relational database.

The database stores all business information required by the application.

Core entities include:

- Users
- Franchises
- Products
- Sales Tickets
- Sales Items
- Weather
- Promotions
- Alerts

Relationships ensure data consistency across the application.

---

## 📊 Main Database Entities

```text
Users
│
├── Administrator
└── Franchise

Products
│
└── Sales Items
      │
      ▼
Sales Tickets

Weather

Promotions

Alerts
```

---

# 🤖 Machine Learning Module

The prediction engine is implemented as an independent FastAPI microservice.

The service communicates with the NestJS backend through REST APIs.

Main responsibilities include:

- Model training
- Model evaluation
- Revenue prediction
- Ticket prediction
- Product demand prediction

The service operates independently, allowing AI models to evolve without impacting the backend.

---

# 🌦 Weather Integration

The platform integrates weather information into business operations.

Weather data is collected and stored before being used by the prediction engine.

Collected variables include:

- Temperature
- Humidity
- Rainfall
- Wind speed
- Weather condition

This information is combined with historical sales data to improve prediction accuracy.

---

# 📈 Prediction Features

The platform currently supports three prediction capabilities.

### 💰 Revenue Prediction

Predicts expected daily revenue using weather conditions and historical sales.

---

### 🎫 Ticket Prediction

Estimates the expected number of sales tickets for a given day.

---

### 🍔 Product Demand Prediction

Predicts the expected demand for individual products, helping franchises anticipate customer needs and optimize inventory planning.

# 🧠 Machine Learning Workflow

The platform integrates an independent **FastAPI** microservice responsible for training and serving Machine Learning models.

Instead of embedding AI logic inside the backend, the prediction engine operates as a separate service, following a microservices architecture.

---

## 📊 Training Process

The training workflow consists of several stages.

### 1. Data Collection

The ML service requests historical data from the NestJS backend through dedicated endpoints.

Training datasets include:

- Historical sales
- Product information
- Weather history
- Revenue data
- Ticket history

---

### 2. Data Preprocessing

Before training, the data is cleaned and transformed.

Processing steps include:

- Missing value handling
- Feature selection
- One-Hot Encoding
- Numerical normalization
- Dataset preparation

---

### 3. Model Training

The platform trains multiple Machine Learning models for each prediction task.

Current algorithms include:

- 📈 Linear Regression
- 🌲 Random Forest Regressor

Each model is trained independently and evaluated using historical data.

---

### 4. Model Evaluation

After training, model performance is evaluated using error metrics.

Examples include:

- Mean Absolute Error (MAE)
- Model comparison
- Best model selection

The model with the lowest prediction error is automatically recommended for future predictions.

---

### 5. Model Persistence

Trained models are serialized and stored using **Joblib**.

This allows predictions to be generated without retraining the models every time the application starts.

---

# 📈 Prediction Workflow

The prediction process follows a simple communication pipeline.

```text
User
 │
 ▼
Frontend
 │
 ▼
NestJS Backend
 │
 ▼
FastAPI ML Service
 │
 ▼
Prediction Generated
 │
 ▼
NestJS Backend
 │
 ▼
Frontend
```

---

## 💰 Revenue Prediction

Revenue prediction estimates the expected sales revenue for a specific day.

Input features include:

- Temperature
- Humidity
- Rainfall
- Wind Speed
- Weather Condition

Output:

- Expected Revenue

---

## 🎫 Ticket Prediction

The platform predicts the expected number of sales tickets for the selected day.

Input features:

- Weather
- Temperature
- Humidity
- Rainfall
- Wind Speed

Output:

- Expected Ticket Count

---

## 🍔 Product Demand Prediction

Demand prediction estimates the quantity expected to be sold for a specific product.

Input features include:

- Product
- Product Category
- Weather Condition

Output:

- Expected Quantity Sold

---

# 🔄 API Communication

The different services communicate using REST APIs.

```text
React Frontend
      │
      ▼
NestJS REST API
      │
      ├──────────────► PostgreSQL
      │
      └──────────────► FastAPI ML Service
```

---

## Backend Responsibilities

The backend is responsible for:

- Authentication
- Business logic
- Database operations
- Weather management
- Image uploads
- Training data generation
- Communication with the ML service

---

## ML Service Responsibilities

The Machine Learning service is responsible for:

- Training AI models
- Loading trained models
- Generating predictions
- Returning prediction results

---

# 🐳 Docker Deployment

All application components are containerized.

Containers include:

| Container | Description |
|-----------|-------------|
| frontend | React Application |
| backend | NestJS REST API |
| ml | FastAPI Prediction Service |
| postgres | PostgreSQL Database |

The complete application can be started with a single command:

```bash
docker compose up --build
```

---

# 🔀 CI/CD

The project includes a Continuous Integration pipeline using **GitHub Actions**.

The pipeline automatically performs:

- Dependency installation
- Project build
- Code validation
- Continuous Integration checks

This helps ensure code quality before deployment.

---

# 📸 Application Screenshots

The following screenshots illustrate the main features of the platform.

## Login

> *(Insert Screenshot)*

---

## Administrator Dashboard

> *(Insert Screenshot)*

---

## Franchise Dashboard

> *(Insert Screenshot)*

---

## Product Management

> *(Insert Screenshot)*

---

## Shopping Cart

> *(Insert Screenshot)*

---

## Weather Dashboard

> *(Insert Screenshot)*

---

## Machine Learning Predictions

> *(Insert Screenshot)*

---

# 🚀 Future Improvements

Potential enhancements include:

- 📊 Interactive dashboards
- 📈 Advanced business analytics
- 📱 Mobile application
- 🌍 Multi-language support
- 🔔 Real-time notifications
- 📦 Inventory management
- 📄 PDF report generation
- 📊 Excel export
- 📍 Multi-region weather integration
- 🤖 Deep Learning models
- ☁️ Cloud deployment
- 📉 Sales forecasting visualizations
- 🔍 Advanced filtering and search
- 📡 Real-time weather synchronization

---

# 🎯 Project Highlights

✔ Full-Stack Web Application

✔ React + TypeScript Frontend

✔ NestJS REST API

✔ PostgreSQL Database

✔ FastAPI Machine Learning Microservice

✔ Dockerized Architecture

✔ Docker Compose Orchestration

✔ JWT Authentication

✔ Product Image Upload

✔ Weather Integration

✔ Revenue Prediction

✔ Ticket Prediction

✔ Product Demand Prediction

✔ GitHub CI/CD Pipeline

✔ Modular & Scalable Architecture

---

# 👨‍💻 Author

Developed as part of a summer internship project focused on combining **restaurant management**, **weather analytics**, and **Machine Learning** to support data-driven business decisions.

---

# 📄 License

This project is intended for educational and internship purposes.

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

Your support is greatly appreciated!