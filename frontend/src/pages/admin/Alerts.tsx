import { useEffect, useState } from "react";
import api from "../../services/api";
import type { Alert } from "../../types/Alert";

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const response = await api.get("/alerts");
      setAlerts(response.data);
    } catch (error) {
      console.error("Error loading admin alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading alerts...</h2>;
  }

  return (
    <div>
      <h1>Alerts</h1>
      <p style={{ color: "#64748b", marginTop: 8 }}>
        Monitor warning messages and their read/unread state.
      </p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Message</th>
            <th style={thStyle}>Severity</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length === 0 ? (
            <tr>
              <td colSpan={5} style={emptyCellStyle}>
                No alerts found.
              </td>
            </tr>
          ) : (
            alerts.map((alert) => (
              <tr key={alert.id}>
                <td style={tdStyle}>{alert.id}</td>
                <td style={tdStyle}>{alert.title}</td>
                <td style={tdStyle}>{alert.message}</td>
                <td style={tdStyle}>{alert.severity}</td>
                <td style={tdStyle}>{alert.isRead ? "Read" : "Unread"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 20,
  background: "#fff",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: "1px solid #e2e8f0",
};

const emptyCellStyle: React.CSSProperties = {
  padding: 18,
  textAlign: "center",
  color: "#64748b",
};

export default Alerts;