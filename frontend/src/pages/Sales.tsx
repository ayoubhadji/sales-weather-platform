import { useEffect, useState } from "react";
import api from "../services/api";
import type { SalesTicket } from "../types/SalesTicket";

function Sales() {
  const [sales, setSales] = useState<SalesTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

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

  if (loading) {
    return <h2>Loading sales tickets...</h2>;
  }

  return (
    <div>
      <h1>Sales Tickets</h1>

      <table
        border={1}
        cellPadding={10}
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Ticket Number</th>
            <th>Sale Date</th>
            <th>Total Amount</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {sales.map((sale) => (
            <>
              <tr key={sale.id}>
                <td>{sale.id}</td>

                <td>{sale.ticketNumber}</td>

                <td>{new Date(sale.saleDate).toLocaleString()}</td>

                <td>{sale.totalAmount} DT</td>

                <td>
                  <button
                    onClick={() =>
                      setExpandedTicket(
                        expandedTicket === sale.id ? null : sale.id
                      )
                    }
                  >
                    {expandedTicket === sale.id
                      ? "Hide Items"
                      : "View Items"}
                  </button>
                </td>
              </tr>

              {expandedTicket === sale.id && (
                <tr>
                  <td colSpan={5}>
                    <table
                      border={1}
                      cellPadding={8}
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginTop: "10px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>

                      <tbody>
                        {sale.items.length > 0 ? (
                          sale.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.product.name}</td>
                              <td>{item.quantity}</td>
                              <td>{item.unitPrice} DT</td>
                              <td>{item.subtotal} DT</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} style={{ textAlign: "center" }}>
                              No items found for this ticket.
                            </td>
                          </tr>
                        )}
                      </tbody>

                      <tfoot>
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              textAlign: "right",
                              fontWeight: "bold",
                            }}
                          >
                            Total
                          </td>

                          <td style={{ fontWeight: "bold" }}>
                            {sale.totalAmount} DT
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Sales;