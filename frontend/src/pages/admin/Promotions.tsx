import { useEffect, useState } from "react";
import api from "../../services/api";
import type { Promotion } from "../../types/Promotion";

function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadPromotions();
  }, []);

  async function loadPromotions() {
    try {
      const response = await api.get("/promotions");
      setPromotions(response.data);
    } catch (error) {
      console.error("Error loading admin promotions:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading promotions...</h2>;
  }

  return (
    <div>
      <h1>Promotions</h1>
      <p style={{ color: "#64748b", marginTop: 8 }}>
        Track active discounts and the reasons behind each campaign.
      </p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Discount</th>
            <th style={thStyle}>Reason</th>
            <th style={thStyle}>Start Date</th>
            <th style={thStyle}>End Date</th>
          </tr>
        </thead>
        <tbody>
          {promotions.length === 0 ? (
            <tr>
              <td colSpan={6} style={emptyCellStyle}>
                No promotions found.
              </td>
            </tr>
          ) : (
            promotions.map((promotion) => (
              <tr key={promotion.id}>
                <td style={tdStyle}>{promotion.id}</td>
                <td style={tdStyle}>{promotion.product?.name ?? "—"}</td>
                <td style={tdStyle}>{promotion.discountPercentage}%</td>
                <td style={tdStyle}>{promotion.reason}</td>
                <td style={tdStyle}>{promotion.startDate}</td>
                <td style={tdStyle}>{promotion.endDate}</td>
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

export default Promotions;