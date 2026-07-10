import { useEffect, useState } from "react";
import api from "../../services/api";
import type { SalesPrediction } from "../../types/SalesPrediction";

function Predictions() {
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadPredictions();
  }, []);

  async function loadPredictions() {
    try {
      const response = await api.get("/sales-predictions");
      setPredictions(response.data);
    } catch (error) {
      console.error("Error loading admin predictions:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading predictions...</h2>;
  }

  return (
    <div>
      <h1>Sales Predictions</h1>
      <p style={{ color: "#64748b", marginTop: 8 }}>
        Review forecasted quantity, revenue and confidence values.
      </p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Weather</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Predicted Quantity</th>
            <th style={thStyle}>Predicted Revenue</th>
            <th style={thStyle}>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {predictions.length === 0 ? (
            <tr>
              <td colSpan={7} style={emptyCellStyle}>
                No predictions found.
              </td>
            </tr>
          ) : (
            predictions.map((prediction) => (
              <tr key={prediction.id}>
                <td style={tdStyle}>{prediction.id}</td>
                <td style={tdStyle}>{prediction.product?.name ?? "—"}</td>
                <td style={tdStyle}>{prediction.weather?.weatherDate ?? "—"}</td>
                <td style={tdStyle}>{prediction.predictionDate}</td>
                <td style={tdStyle}>{prediction.predictedQuantity}</td>
                <td style={tdStyle}>{prediction.predictedRevenue} DT</td>
                <td style={tdStyle}>{prediction.confidence}%</td>
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

export default Predictions;