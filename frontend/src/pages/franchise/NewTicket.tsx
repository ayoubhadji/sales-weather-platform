import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Plus, Minus, Trash2, UtensilsCrossed } from "lucide-react";
import api from "../../services/api";
import { useTicket } from "../../context/TicketContext";
import PageHeader from "../../components/PageHeader";
import { card, colors, primaryButton, table, th, td } from "../../styles/common";

function NewTicket() {
  const navigate = useNavigate();
  const {
    items,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    totalAmount,
  } = useTicket();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);

    try {
      const saleDate = new Date().toISOString();

      const ticketResponse = await api.post("/sales-ticket", {
        saleDate,
      });

      const ticketId = ticketResponse.data.id;

      await Promise.all(
        items.map((item) =>
          api.post("/sales-item", {
            ticket: ticketId,
            product: item.product.id,
            quantity: item.quantity,
          }),
        ),
      );

      clearCart();
      navigate("/franchise/tickets");
    } catch (err) {
      setError("Impossible de creer le ticket. Reessaie.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div>
        <PageHeader icon={Receipt} title="Nouveau ticket" />
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <UtensilsCrossed size={32} color={colors.textMuted} style={{ marginBottom: "12px" }} />
          <p style={{ color: colors.textMuted, marginBottom: "16px" }}>
            Ton panier est vide pour le moment.
          </p>
          <button style={primaryButton} onClick={() => navigate("/franchise/menu")}>
            Aller au menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{receiptStyles}</style>

      <PageHeader
        icon={Receipt}
        title="Nouveau ticket"
        description={`${items.length} produit(s) different(s) dans le panier`}
      />

      <div style={card}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Produit</th>
              <th style={th}>Prix unit.</th>
              <th style={th}>Quantite</th>
              <th style={th}>Sous-total</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ product, quantity }) => (
              <tr key={product.id}>
                <td style={td}>{product.name}</td>
                <td style={td}>{product.price} DT</td>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => decrementItem(product.id)}
                      style={stepperButtonStyle}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: "20px", textAlign: "center" }}>{quantity}</span>
                    <button
                      onClick={() => incrementItem(product.id)}
                      style={stepperButtonStyle}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </td>
                <td style={td}>{(Number(product.price) * quantity).toFixed(2)} DT</td>
                <td style={td}>
                  <button
                    onClick={() => removeItem(product.id)}
                    style={{ ...stepperButtonStyle, color: colors.danger }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "16px",
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <span style={{ fontSize: "14px", color: colors.textMuted }}>Total</span>
          <span style={{ fontSize: "22px", fontWeight: 700, color: colors.dark }}>
            {totalAmount.toFixed(2)} DT
          </span>
        </div>

        {error && (
          <p style={{ color: colors.danger, fontSize: "13px", marginTop: "12px" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "flex-end" }}>
          <button
            onClick={() => navigate("/franchise/menu")}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: `1px solid ${colors.border}`,
              background: "#fff",
              color: colors.dark,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Continuer mes achats
          </button>
          <button style={primaryButton} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Validation..." : "Valider le ticket"}
          </button>
        </div>
      </div>

      <CartReceiptPreview items={items} totalAmount={totalAmount} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small live receipt preview — mirrors the paper-receipt look used for       */
/* confirmed tickets, but marked as a draft since nothing's submitted yet.    */
/* -------------------------------------------------------------------------- */

function CartReceiptPreview({
  items,
  totalAmount,
}: {
  items: { product: { name: string; price: number | string }; quantity: number }[];
  totalAmount: number;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "24px 16px 4px" }}>
      <div className="receipt-paper receipt-paper-sm">
        <div className="receipt-jagged receipt-jagged-top" />

        <div className="receipt-body receipt-body-sm">
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: "0.06em" }}>
              SALES WEATHER
            </div>
            <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.08em" }}>
              PREVIEW — NOT YET SUBMITTED
            </div>
          </div>

          <div className="receipt-dashed" />

          <div style={{ fontSize: 11, marginBottom: 8, color: "#64748b" }}>
            {new Date().toLocaleString()}
          </div>

          <div className="receipt-dashed" />

          <div style={{ margin: "8px 0" }}>
            {items.map(({ product, quantity }) => (
              <div key={product.name} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "baseline", fontSize: 11 }}>
                  <span style={{ whiteSpace: "nowrap" }}>
                    {product.name} x{quantity}
                  </span>
                  <span className="receipt-leader" />
                  <span style={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                    {(Number(product.price) * quantity).toFixed(2)} DT
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="receipt-dashed" />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              fontWeight: 800,
              margin: "8px 0",
            }}
          >
            <span>TOTAL</span>
            <span>{totalAmount.toFixed(2)} DT</span>
          </div>

          <div className="receipt-dashed" />

          <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#94a3b8" }}>
            Ce ticket sera genere apres validation
          </div>
        </div>

        <div className="receipt-jagged receipt-jagged-bottom" />
      </div>
    </div>
  );
}

const stepperButtonStyle = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: colors.dark,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
};

const receiptStyles = `
.receipt-paper {
  width: 100%;
  max-width: 320px;
  position: relative;
  filter: drop-shadow(0 8px 16px rgba(15,23,42,0.12));
}
.receipt-paper-sm {
  max-width: 240px;
}
.receipt-body {
  background: #fffef8;
  padding: 22px 20px;
  font-family: 'Courier New', Courier, monospace;
  color: #1e293b;
}
.receipt-body-sm {
  padding: 16px 14px;
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
`;

export default NewTicket;