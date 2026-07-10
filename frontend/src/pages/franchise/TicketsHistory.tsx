import { Fragment, useEffect, useState } from "react";
import api from "../../services/api";
import type { SalesTicket } from "../../types/SalesTicket";
import PageHeader from "../../components/PageHeader";
import { card, colors } from "../../styles/common";
import { Receipt } from "lucide-react";

function TicketsHistory() {
  const [tickets, setTickets] = useState<SalesTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null);

  useEffect(() => {
    void loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const response = await api.get("/sales-ticket");
      setTickets(response.data);
    } catch (error) {
      console.error("Error loading franchise ticket history:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        icon={Receipt}
        title="Ticket History"
        description="Review ticket totals and the items included in each sale."
      />

      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <div style={card}>
          <p style={{ color: colors.textMuted, margin: 0 }}>No tickets have been created yet.</p>
        </div>
      ) : (
        <div style={card}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Ticket</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <Fragment key={ticket.id}>
                  <tr key={ticket.id}>
                    <td style={tdStyle}>{ticket.ticketNumber}</td>
                    <td style={tdStyle}>{ticket.saleDate}</td>
                    <td style={tdStyle}>{ticket.totalAmount} DT</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                        style={toggleButtonStyle}
                      >
                        {expandedTicket === ticket.id ? "Hide items" : "View items"}
                      </button>
                    </td>
                  </tr>

                  {expandedTicket === ticket.id && (
                    <tr>
                      <td colSpan={4} style={{ padding: 0 }}>
                        <div style={nestedWrapperStyle}>
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
                              {ticket.items.length > 0 ? (
                                ticket.items.map((item) => (
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
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const nestedTableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const nestedWrapperStyle: React.CSSProperties = {
  padding: 0,
  background: "#f8fafc",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: `1px solid ${colors.border}`,
  background: "#f8fafc",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: `1px solid ${colors.border}`,
};

const toggleButtonStyle: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  borderRadius: 10,
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

const emptyCellStyle: React.CSSProperties = {
  padding: 16,
  textAlign: "center",
  color: colors.textMuted,
};

export default TicketsHistory;