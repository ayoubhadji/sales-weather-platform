import { useEffect, useState } from "react";
import { Fragment } from "react";
import api from "../../services/api";
import type { SalesTicket } from "../../types/SalesTicket";

function Sales() {
  const [sales, setSales] = useState<SalesTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

  useEffect(() => {
    void loadSales();
  }, []);

  async function loadSales() {
    try {
      const response = await api.get("/sales-ticket");
      setSales(response.data);
    } catch (error) {
      console.error("Error loading admin sales:", error);
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
      <p style={{ color: "#64748b", marginTop: 8 }}>
        View all ticket totals and line items captured by the platform.
      </p>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Ticket Number</th>
            <th style={thStyle}>Sale Date</th>
            <th style={thStyle}>Total Amount</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <Fragment key={sale.id}>
              <tr>
                <td style={tdStyle}>{sale.id}</td>
                <td style={tdStyle}>{sale.ticketNumber}</td>
                <td style={tdStyle}>{new Date(sale.saleDate).toLocaleString()}</td>
                <td style={tdStyle}>{sale.totalAmount} DT</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => setExpandedTicket(expandedTicket === sale.id ? null : sale.id)}
                    style={actionButtonStyle}
                  >
                    {expandedTicket === sale.id ? "Hide items" : "View items"}
                  </button>
                </td>
              </tr>

              {expandedTicket === sale.id && (
                <tr>
                  <td colSpan={5} style={expandedCellStyle}>
                    <table style={nestedTableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Product</th>
                          <th style={thStyle}>Quantity</th>
                          <th style={thStyle}>Unit Price</th>
                          <th style={thStyle}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items.length > 0 ? (
                          sale.items.map((item) => (
                            <tr key={item.id}>
                              <td style={tdStyle}>{item.product.name}</td>
                              <td style={tdStyle}>{item.quantity}</td>
                              <td style={tdStyle}>{item.unitPrice} DT</td>
                              <td style={tdStyle}>{item.subtotal} DT</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} style={emptyCellStyle}>
                              No items found for this ticket.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
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

const nestedTableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#f8fafc",
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

const expandedCellStyle: React.CSSProperties = {
  padding: 0,
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

const emptyCellStyle: React.CSSProperties = {
  padding: 18,
  textAlign: "center",
  color: "#64748b",
};

export default Sales;