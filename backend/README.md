# Sales Weather Prediction Platform - Backend

## 📌 Overview

The backend of the **Sales Weather Prediction Platform** is built with **NestJS** and **PostgreSQL**.

It provides REST APIs for managing:

- Products
- Weather records
- Sales Tickets
- Sales Items
- Promotions
- Alerts
- Sales Predictions

The backend also contains business logic such as:

- Automatic product price retrieval
- Automatic subtotal calculation
- Automatic ticket total calculation
- Automatic ticket number generation

---

## 🛠 Technologies

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- class-validator
- dotenv

---

## 📂 Project Structure

```
src/
│
├── alerts/
├── products/
├── promotions/
├── sales-item/
├── sales-predictions/
├── sales-ticket/
├── weather/
│
├── common/
├── app.module.ts
└── main.ts
```

---

## ⚙️ Installation

Clone the repository

```bash
git clone <repository-url>
```

Go to the backend

```bash
cd backend/api
```

Install dependencies

```bash
npm install
```

---

## 🔧 Environment Variables

Create a `.env` file.

Example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=sales_weather

PORT=3000
```

---

## ▶️ Run the Project

Development

```bash
npm run start:dev
```

Production

```bash
npm run build
npm run start:prod
```

---

## 🗄 Database

Database: PostgreSQL

The project uses TypeORM with automatic synchronization during development.

---

## 📦 Main Modules

### Products

Manage products sold by the business.

---

### Weather

Stores weather conditions used later for sales prediction.

---

### Sales Tickets

Represents customer sales transactions.

Business Logic:

- Automatic ticket number generation
- Automatic total amount calculation

---

### Sales Items

Represents products inside a sales ticket.

Business Logic:

- Product price retrieved automatically
- Subtotal calculated automatically
- Ticket total updated automatically

---

### Promotions

Stores promotional campaigns.

---

### Alerts

Stores business alerts.

---

### Sales Predictions

Stores predicted sales values (currently CRUD).

This module will later be connected to the Machine Learning model.

---

## 📡 API

REST API running on

```
http://localhost:3000
```

Example endpoints

```
GET /products
GET /weather
GET /sales-ticket
GET /sales-item
GET /promotions
GET /alerts
GET /sales-predictions
```

---

## 🚀 Future Improvements

- OpenWeather API integration
- Machine Learning prediction service
- Recommendation engine
- Authentication
- Docker deployment