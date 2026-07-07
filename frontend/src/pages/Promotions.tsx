import { useEffect, useState } from "react";
import api from "../services/api";
import type { Promotion } from "../types/Promotion";

function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromotions();
  }, []);

  async function loadPromotions() {
    try {
      const response = await api.get("/promotions");
      setPromotions(response.data);
    } catch (error) {
      console.error("Error loading promotions:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>Promotions</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Discount</th>
            <th>Reason</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>

        <tbody>
          {promotions.map((promotion) => (
            <tr key={promotion.id}>
              <td>{promotion.id}</td>
              <td>{promotion.product?.name}</td>
              <td>{promotion.discountPercentage}%</td>
              <td>{promotion.reason}</td>
              <td>{promotion.startDate}</td>
              <td>{promotion.endDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Promotions;