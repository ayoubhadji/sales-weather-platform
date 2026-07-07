import { useEffect, useState } from "react";
import api from "../services/api";
import type { Alert } from "../types/Alert";

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const response = await api.get("/alerts");
      setAlerts(response.data);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>Alerts</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Message</th>
            <th>Severity</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {alerts.map((alert) => (
            <tr key={alert.id}>
              <td>{alert.id}</td>
              <td>{alert.title}</td>
              <td>{alert.message}</td>
              <td>{alert.severity}</td>
              <td>{alert.isRead ? "Read" : "Unread"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Alerts;