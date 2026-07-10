import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Plus, Minus, ShoppingCart } from "lucide-react";
import api from "../../services/api";
import type { Product } from "../../types/Product";
import { useTicket } from "../../context/TicketContext";
import PageHeader from "../../components/PageHeader";
import { card, colors, primaryButton } from "../../styles/common";

function ProductMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const navigate = useNavigate();

  const { items, addProduct, incrementItem, decrementItem, totalItems, totalAmount } =
    useTicket();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["Tous", ...Array.from(set)];
  }, [products]);

  const filteredProducts =
    activeCategory === "Tous"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const quantityInCart = (productId: number) =>
    items.find((i) => i.product.id === productId)?.quantity ?? 0;

  return (
    <div style={{ paddingBottom: totalItems > 0 ? "80px" : 0 }}>
      <PageHeader
        icon={UtensilsCrossed}
        title="Menu produits"
        description="Ajoutez des articles au panier pour creer un ticket."
      />

      {/* Category filters */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: "999px",
              border: `1px solid ${activeCategory === cat ? colors.dark : colors.border}`,
              backgroundColor: activeCategory === cat ? colors.dark : "#fff",
              color: activeCategory === cat ? "#fff" : colors.dark,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: colors.textMuted }}>Chargement...</p>
      ) : filteredProducts.length === 0 ? (
        <div style={card}>
          <p style={{ color: colors.textMuted }}>Aucun produit dans cette categorie.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {filteredProducts.map((product) => {
            const qty = quantityInCart(product.id);
            return (
              <div key={product.id} style={{ ...card, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    width: "100%",
                    height: "100px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px",
                  }}
                >
                  <UtensilsCrossed size={28} color={colors.textMuted} />
                </div>

                <div style={{ fontSize: "11px", color: colors.accentDark, fontWeight: 600, textTransform: "uppercase" }}>
                  {product.category}
                </div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: colors.dark, margin: "4px 0 8px" }}>
                  {product.name}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: colors.dark, marginBottom: "12px" }}>
                  {product.price} DT
                </div>

                <div style={{ marginTop: "auto" }}>
                  {qty === 0 ? (
                    <button
                      onClick={() => addProduct(product)}
                      style={{ ...primaryButton, width: "100%", justifyContent: "center" }}
                    >
                      <Plus size={16} />
                      Ajouter
                    </button>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: `1px solid ${colors.border}`,
                        borderRadius: "8px",
                        padding: "4px",
                      }}
                    >
                      <button
                        onClick={() => decrementItem(product.id)}
                        style={stepperButtonStyle}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: 700, color: colors.dark }}>{qty}</span>
                      <button
                        onClick={() => incrementItem(product.id)}
                        style={stepperButtonStyle}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: colors.dark,
            color: "#fff",
            borderRadius: "12px",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            zIndex: 50,
          }}
        >
          <ShoppingCart size={18} />
          <span style={{ fontSize: "14px" }}>
            {totalItems} article(s) — {totalAmount.toFixed(2)} DT
          </span>
          <button
            onClick={() => navigate("/franchise/tickets/new")}
            style={{
              backgroundColor: colors.accent,
              color: colors.dark,
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Voir le ticket
          </button>
        </div>
      )}
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
  padding: "4px 8px",
};

export default ProductMenu;