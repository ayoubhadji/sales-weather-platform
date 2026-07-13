import { Fragment, useEffect, useState } from "react";
import api from "../../services/api";
import type { SalesTicket } from "../../types/SalesTicket";
import PageHeader from "../../components/PageHeader";
import { card, colors } from "../../styles/common";
import { Receipt, ChevronDown, ChevronUp } from "lucide-react";

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
      <style>{receiptStyles}</style>

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
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const isOpen = expandedTicket === ticket.id;
                return (
                  <Fragment key={ticket.id}>
                    <tr style={{ backgroundColor: isOpen ? "#f8fafc" : "transparent" }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{ticket.ticketNumber}</td>
                      <td style={tdStyle}>{ticket.saleDate}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{ticket.totalAmount} DT</td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        <button
                          onClick={() => setExpandedTicket(isOpen ? null : ticket.id)}
                          style={toggleButtonStyle}
                        >
                          {isOpen ? "Hide receipt" : "View receipt"}
                          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={4} style={{ padding: 0, border: "none" }}>
                          <div style={nestedWrapperStyle}>
                            <TicketReceipt ticket={ticket} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Paper receipt                                                              */
/* -------------------------------------------------------------------------- */

function TicketReceipt({ ticket }: { ticket: SalesTicket }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "28px 16px" }}>
      <div className="receipt-paper">
        <div className="receipt-jagged receipt-jagged-top" />

        <div className="receipt-body">
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.06em" }}>
              SALES WEATHER
            </div>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.08em" }}>
              PLATFORM RECEIPT
            </div>
          </div>

          <div className="receipt-dashed" />

          <div style={{ fontSize: 12, marginBottom: 2 }}>
            Ticket&nbsp;#: <strong>{ticket.ticketNumber}</strong>
          </div>
          <div style={{ fontSize: 12, marginBottom: 10 }}>
            Date: {new Date(ticket.saleDate).toLocaleString()}
          </div>

          <div className="receipt-dashed" />

          <div style={{ margin: "10px 0" }}>
            {ticket.items.length > 0 ? (
              ticket.items.map((item) => (
                <div key={item.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "baseline", fontSize: 12 }}>
                    <span style={{ whiteSpace: "nowrap" }}>
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="receipt-leader" />
                    <span style={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                      {item.subtotal} DT
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>
                    {item.unitPrice} DT / unit
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>
                No items found for this ticket.
              </div>
            )}
          </div>

          <div className="receipt-dashed" />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 15,
              fontWeight: 800,
              margin: "10px 0",
            }}
          >
            <span>TOTAL</span>
            <span>{ticket.totalAmount} DT</span>
          </div>

          <div className="receipt-dashed" />

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 10 }}>
              Thank you for your purchase!
            </div>
            <div className="receipt-barcode" aria-hidden="true">
              {Array.from({ length: 28 }).map((_, i) => (
                <span key={i} style={{ width: (i * 7) % 3 === 0 ? 3 : 1.5 }} />
              ))}
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#334155", marginTop: 4 }}>
              {ticket.ticketNumber}
            </div>
          </div>
        </div>

        <div className="receipt-jagged receipt-jagged-bottom" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const nestedWrapperStyle: React.CSSProperties = {
  background: "#eef2f6",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: `2px solid ${colors.border}`,
  background: "#f8fafc",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: colors.textMuted,
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: 14,
};

const toggleButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "1px solid #cbd5e1",
  background: "#fff",
  borderRadius: 10,
  padding: "8px 12px",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const receiptStyles = `
.receipt-paper {
  width: 100%;
  max-width: 320px;
  position: relative;
  filter: drop-shadow(0 8px 16px rgba(15,23,42,0.12));
}
.receipt-body {
  background: #fffef8;
  padding: 22px 20px;
  font-family: 'Courier New', Courier, monospace;
  color: #1e293b;
}
.receipt-jagged {
  height: 10px;
  background-image:
    linear-gradient(135deg, #eef2f6 50%, transparent 50%),
    linear-gradient(45deg, #eef2f6 50%, transparent 50%);
  background-size: 14px 14px;
  background-repeat: repeat-x;
}
.receipt-jagged-top {
  background-color: #fffef8;
  background-position: bottom;
}
.receipt-jagged-bottom {
  background-color: #fffef8;
  background-position: top;
  transform: scaleY(-1);
}
.receipt-dashed {
  border-top: 1px dashed #cbd5e1;
  margin: 8px 0;
}
.receipt-leader {
  flex: 1;
  margin: 0 6px;
  border-bottom: 1px dotted #94a3b8;
  transform: translateY(-3px);
}
.receipt-barcode {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 2px;
  height: 34px;
}
.receipt-barcode span {
  display: inline-block;
  height: 100%;
  background: #1e293b;
}
`;

export default TicketsHistory;