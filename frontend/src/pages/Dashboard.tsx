import { useEffect, useState } from "react";
import api from "../services/api";

interface DashboardStats {
  products: number;
  weather: number;
  sales: number;
  promotions: number;
  alerts: number;
}

interface SalesTicket {
  id: number;
  ticketNumber: string;
  totalAmount: number;
}

interface Alert {
  id: number;
  title: string;
}

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    weather: 0,
    sales: 0,
    promotions: 0,
    alerts: 0,
  });

  const [recentSales, setRecentSales] = useState<SalesTicket[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [
        products,
        weather,
        sales,
        promotions,
        alerts,
      ] = await Promise.all([
        api.get("/products"),
        api.get("/weather"),
        api.get("/sales-ticket"),
        api.get("/promotions"),
        api.get("/alerts"),
      ]);

      setStats({
        products: products.data.length,
        weather: weather.data.length,
        sales: sales.data.length,
        promotions: promotions.data.length,
        alerts: alerts.data.length,
      });

      setRecentSales(sales.data.slice(-5).reverse());
      setRecentAlerts(alerts.data.slice(-5).reverse());

    } catch (error) {
      console.error(error);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    minWidth: "180px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  };

  return (
    <div>

      <h1>Dashboard</h1>

      <p>Welcome to the Sales Weather Prediction Platform</p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "30px",
        }}
      >
        <div style={cardStyle}>
          <h3>📦 Products</h3>
          <h1>{stats.products}</h1>
        </div>

        <div style={cardStyle}>
          <h3>🧾 Sales</h3>
          <h1>{stats.sales}</h1>
        </div>

        <div style={cardStyle}>
          <h3>🌦 Weather</h3>
          <h1>{stats.weather}</h1>
        </div>

        <div style={cardStyle}>
          <h3>🎁 Promotions</h3>
          <h1>{stats.promotions}</h1>
        </div>

        <div style={cardStyle}>
          <h3>🚨 Alerts</h3>
          <h1>{stats.alerts}</h1>
        </div>

      </div>

      <div
        style={{
          display: "flex",
          gap: "30px",
          marginTop: "50px",
        }}
      >

        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h2>Recent Sales</h2>

          {recentSales.map((sale) => (
            <p key={sale.id}>
              {sale.ticketNumber} — {sale.totalAmount} DT
            </p>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h2>Recent Alerts</h2>

          {recentAlerts.map((alert) => (
            <p key={alert.id}>{alert.title}</p>
          ))}
        </div>

      </div>

    </div>
  );
}

export default Dashboard;