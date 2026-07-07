import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    weather: 0,
    sales: 0,
    promotions: 0,
    alerts: 0,
  });

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
        api.get("/sales-ticket"), // Change if your endpoint is different
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
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <table border={1} cellPadding={15}>
        <tbody>
          <tr>
            <td><strong>Total Products</strong></td>
            <td>{stats.products}</td>
          </tr>

          <tr>
            <td><strong>Weather Records</strong></td>
            <td>{stats.weather}</td>
          </tr>

          <tr>
            <td><strong>Sales Tickets</strong></td>
            <td>{stats.sales}</td>
          </tr>

          <tr>
            <td><strong>Promotions</strong></td>
            <td>{stats.promotions}</td>
          </tr>

          <tr>
            <td><strong>Alerts</strong></td>
            <td>{stats.alerts}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;