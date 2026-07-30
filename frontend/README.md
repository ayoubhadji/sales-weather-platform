# 🌤️ Sales Weather Platform - Frontend

## 📌 Overview

The frontend of the **Sales Weather Platform** is developed with **React**, **TypeScript**, and **Vite**.

It provides two dedicated user interfaces:

- 👨‍💼 **Administrator Dashboard**
- 🏪 **Franchise Dashboard**

The application communicates with the NestJS backend through a REST API secured with JWT authentication and allows users to manage products, sales, weather information, and restaurant operations.

---

# 🚀 Features

## 👨‍💼 Administrator

- Dashboard
- Product management
- Product image upload
- Product editing
- Franchise management
- Franchise statistics
- Weather management
- Promotions
- Alerts
- Sales overview

---

## 🏪 Franchise

- Secure login
- Dashboard
- Weather dashboard
- Product menu
- Shopping cart
- Ticket creation
- Ticket history

---

## 🔒 Authentication

- JWT Authentication
- Protected routes
- Role-based navigation
- Automatic token storage
- Automatic Authorization header with Axios

---

# 🛠 Tech Stack

- React
- TypeScript
- Vite
- React Router DOM
- Axios
- Lucide React
- Context API

---

# 📂 Project Structure

```text
src/
│
├── components/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── PageHeader.tsx
│
├── context/
│   ├── AuthContext.tsx
│   └── TicketContext.tsx
│
├── layouts/
│   ├── AdminLayout.tsx
│   └── FranchiseLayout.tsx
│
├── pages/
│   ├── admin/
│   ├── auth/
│   └── franchise/
│
├── services/
│   ├── api.ts
│   └── auth.ts
│
├── styles/
├── types/
│
├── App.tsx
└── main.tsx
```

---

# ⚙️ Installation

Navigate to the frontend folder

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

---

# ▶️ Running the Project

```bash
npm run dev
```

Application URL

```
http://localhost:5173
```

---

# 🔗 Backend Connection

Axios is configured inside

```
src/services/api.ts
```

Default backend URL

```
http://localhost:3000
```

JWT tokens are automatically attached to every protected request using an Axios interceptor.

---

# 📄 Pages

## 👨‍💼 Administrator

### Dashboard

Displays key business indicators and platform statistics.

---

### Products

- View products
- Search products
- Add products
- Edit products
- Delete products
- Upload product images

---

### Franchises

- View franchises
- Franchise statistics
- Activate / Deactivate franchises

---

### Sales

Displays sales tickets and detailed ticket items.

---

### Weather

Displays weather information imported from the backend.

---

### Promotions

Manage promotional campaigns.

---

### Alerts

Displays system alerts.

---

## 🏪 Franchise

### Dashboard

Displays restaurant activity and useful information.

---

### Product Menu

- Browse products
- Filter by category
- View product images
- Add items to the cart

---

### New Ticket

- Shopping cart
- Quantity management
- Automatic total calculation
- Ticket validation

---

### Ticket History

Displays all tickets created by the connected franchise.

---

### Weather

Displays current weather conditions to assist daily operations.

---

# 🎨 UI Features

- Responsive sidebar
- Fixed navigation
- Product cards
- Product image preview
- Search functionality
- Shopping cart
- Loading states
- Empty states
- Modern dashboard design

---

# 🚀 Future Improvements

- Charts and analytics
- Advanced filters
- Report generation
- PDF / Excel export
- Dark mode
- Notifications
- Inventory management
- Machine Learning prediction visualization
- Responsive mobile interface

---

# 👨‍💻 Author

Developed as part of the **Sales Weather Platform** project using **React**, **TypeScript**, and **NestJS**.