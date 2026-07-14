# 🌤️ Sales Weather Platform - Backend

## 📌 Overview

The backend of the **Sales Weather Platform** is built with **NestJS**, **PostgreSQL**, and **TypeORM**.

It exposes a secure REST API used by both **administrators** and **franchise managers** to manage restaurant operations, weather information, sales, products, and business insights.

The application follows a modular architecture and integrates JWT authentication, image uploads, and weather data to support future sales prediction features.

---

# 🚀 Features

## 👨‍💼 Administration

- Product management
- Product image upload
- Franchise management
- User management
- Weather management
- Sales monitoring
- Promotions management
- Business alerts
- Sales predictions

---

## 🏪 Franchise

- Secure authentication
- Product catalog
- Ticket creation
- Ticket history
- Weather dashboard

---

## 🔒 Security

- JWT Authentication
- Role-based access (Admin / Franchise)
- Protected API endpoints

---

# 🛠 Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Passport JWT
- Multer
- class-validator
- dotenv

---

# 📂 Project Structure

```text
src/
│
├── alerts/
├── auth/
│   ├── guards/
│   └── strategies/
│
├── common/
│
├── products/
├── promotions/
├── sales-item/
├── sales-predictions/
├── sales-ticket/
├── users/
├── weather/
│
├── app.module.ts
└── main.ts

uploads/
└── products/
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone <repository-url>
```

Navigate to the backend

```bash
cd backend/api
```

Install dependencies

```bash
npm install
```

---

# 🔧 Environment Variables

Create a `.env` file in the project root.

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=sales_weather

PORT=3000
```

---

# ▶️ Running the Project

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

# 🗄 Database

Database engine:

- PostgreSQL

ORM:

- TypeORM

During development the project uses automatic schema synchronization.

---

# 📦 Main Modules

## 🔐 Authentication

- User login
- JWT generation
- Protected routes
- Role management

---

## 👥 Users

Manage platform users.

Features:

- Admin accounts
- Franchise accounts
- Franchise activation/deactivation
- Franchise statistics

---

## 🍔 Products

Manage products available for sale.

Features:

- Create products
- Update products
- Delete products
- Upload product images
- Static image serving

---

## 🧾 Sales Tickets

Represents customer purchases.

Business logic:

- Automatic ticket number generation
- Logged-in franchise ownership
- Automatic ticket total calculation

---

## 🛒 Sales Items

Represents products contained in a ticket.

Business logic:

- Product price retrieved automatically
- Automatic subtotal calculation
- Automatic ticket total update

---

## 🌦 Weather

Stores weather conditions retrieved from the weather service.

Used as input for future prediction models.

---

## 📈 Sales Predictions

Stores predicted sales values.

Currently CRUD-based and prepared for future Machine Learning integration.

---

## 🎁 Promotions

Manage promotional campaigns and discounts.

---

## 🚨 Alerts

Stores operational and business alerts.

---

# 🖼 File Uploads

The backend supports image uploads using **Multer**.

Uploaded files are stored in:

```text
uploads/products/
```

Images are publicly accessible through:

```
http://localhost:3000/uploads/products/<filename>
```

---

# 📡 REST API

Default URL

```
http://localhost:3000
```

Example endpoints

```http
POST   /auth/login

GET    /users
GET    /users/franchises
GET    /users/franchises/stats

GET    /products
POST   /products
PATCH  /products/:id
DELETE /products/:id
POST   /products/upload

GET    /sales-ticket
POST   /sales-ticket

GET    /sales-item
POST   /sales-item

GET    /weather

GET    /promotions

GET    /alerts

GET    /sales-predictions
```

---

# 🚀 Future Improvements

- Machine Learning sales prediction
- AI-powered recommendations
- Inventory management
- Email notifications
- Docker support
- Kubernetes deployment
- CI/CD pipeline
- Reporting (PDF / Excel exports)

---

# 👨‍💻 Author

Developed as part of the **Sales Weather Platform** project using **NestJS**, **React**, and **PostgreSQL**.git 