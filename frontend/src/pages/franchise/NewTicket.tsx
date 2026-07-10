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

export default NewTicket;