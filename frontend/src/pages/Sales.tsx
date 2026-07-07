import { useEffect, useState } from "react";
import api from "../services/api";
import type { SalesTicket } from "../types/SalesTicket";

function Sales() {
  const [sales, setSales] = useState<SalesTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      const response = await api.get("/sales-ticket");
      setSales(response.data);
    } catch (error) {
      console.error("Error loading sales:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>Sales Tickets</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Ticket Number</th>
            <th>Sale Date</th>
            <th>Total Amount (DT)</th>
          </tr>
        </thead>

        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id}>
              <td>{sale.id}</td>
              <td>{sale.ticketNumber}</td>
              <td>{sale.saleDate}</td>
              <td>{sale.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Sales;