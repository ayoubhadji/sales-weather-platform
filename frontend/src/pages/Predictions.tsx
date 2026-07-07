import { useEffect, useState } from "react";
import api from "../services/api";
import type { SalesPrediction } from "../types/SalesPrediction";

function Predictions() {
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
  }, []);

  async function loadPredictions() {
    try {
      const response = await api.get("/sales-predictions");
      setPredictions(response.data);
    } catch (error) {
      console.error("Error loading predictions:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>Sales Predictions</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Date</th>
            <th>Predicted Quantity</th>
            <th>Predicted Revenue</th>
            <th>Confidence</th>
          </tr>
        </thead>

        <tbody>
          {predictions.map((prediction) => (
            <tr key={prediction.id}>
              <td>{prediction.id}</td>
              <td>{prediction.product?.name}</td>
              <td>{prediction.predictionDate}</td>
              <td>{prediction.predictedQuantity}</td>
              <td>{prediction.predictedRevenue} DT</td>
              <td>{prediction.confidence}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Predictions;