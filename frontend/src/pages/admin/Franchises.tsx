import { useEffect, useState } from "react";
import api from "../../services/api";
import type { User } from "../../types/User";
import type { FranchiseStats } from "../../types/FranchiseStats";

function Franchises() {
  const [franchises, setFranchises] = useState<FranchiseStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadFranchises();
  }, []);

  async function loadFranchises() {
    try {
    const response = await api.get("/users/franchises/stats");
      setFranchises(response.data);
    } catch (error) {
      console.error("Error loading franchises:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id: number) {
  try {
    await api.patch(`/users/${id}/toggle-status`);

    // Reload the list to refresh the status
    await loadFranchises();
  } catch (error) {
    console.error("Error updating franchise status:", error);
  }
}

  if (loading) {
    return <h2>Loading franchises...</h2>;
  }

  return (
    <div>
      <h1>Franchises</h1>

      <p style={{ color: "#64748b", marginTop: 8 }}>
        View and manage all franchise stores registered in the platform.
      </p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Store</th>
            <th style={thStyle}>City</th>
            <th style={thStyle}>Tickets</th>
            <th style={thStyle}>Revenue</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {franchises.map((franchise) => (
            <tr key={franchise.id}>
              <td style={tdStyle}>{franchise.name}</td>

              <td style={tdStyle}>{franchise.city}</td>

              <td style={tdStyle}>
                <strong>{franchise.tickets}</strong>
              </td>

              <td style={tdStyle}>
                <strong>{franchise.revenue.toFixed(2)} DT</strong>
              </td>

              <td style={tdStyle}>
                <span
                  style={{
                    color: franchise.isActive ? "#16a34a" : "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  {franchise.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td style={tdStyle}>
                <button
                    onClick={() => toggleStatus(franchise.id)}
                    style={{
                    ...(franchise.isActive
                        ? deactivateButtonStyle
                        : activateButtonStyle),
                    marginRight: 10,
                    }}
                >
                    {franchise.isActive ? "Deactivate" : "Activate"}
                </button>

                <button style={actionButtonStyle}>
                    Edit
                </button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
const activateButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const deactivateButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  background: "#dc2626",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

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

const actionButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ef4444",
  background: "#ef4444",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

export default Franchises;