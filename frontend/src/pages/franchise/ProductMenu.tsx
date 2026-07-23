import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Plus, Minus, ShoppingCart, Search } from "lucide-react";
import api from "../../services/api";
import type { Product } from "../../types/Product";
import type { Promotion } from "../../types/Promotion";
import { useTicket } from "../../context/TicketContext";
import PageHeader from "../../components/PageHeader";
import { colors } from "../../styles/common";

function ProductMenu() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("Tous");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { items, addProduct, incrementItem, decrementItem, totalItems, totalAmount } =
    useTicket();

  // Maps productId -> its currently applied promotion (if any), so the
  // menu can show a struck-through old price + the discounted new price.
  const [activePromotions, setActivePromotions] = useState<Map<number, Promotion>>(new Map());

  useEffect(() => {
    loadProducts();
    loadPromotions();
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

  async function loadPromotions() {
    try {
      const response = await api.get("/promotions");
      const promotions: Promotion[] = response.data;
      const map = new Map<number, Promotion>();
      for (const promo of promotions) {
        // Only "applied" promotions actually reflect the current product
        // price — planned/expired-but-unreverted ones are ignored here.
        if (promo.applied && promo.product) {
          map.set(promo.product.id, promo);
        }
      }
      setActivePromotions(map);
    } catch (error) {
      console.error("Error loading promotions:", error);
    }
  }

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["Tous", ...Array.from(set)];
  }, [products]);

  function isPromoActiveToday(promotion: Promotion): boolean {
    const now = new Date();
    return (
      promotion.applied &&
      now >= new Date(promotion.startDate) &&
      now <= new Date(promotion.endDate)
    );
  }

  const promoCount = useMemo(
    () =>
      products.filter((p) => {
        const promo = activePromotions.get(p.id);
        return promo && isPromoActiveToday(promo);
      }).length,
    [products, activePromotions]
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());

    if (activeCategory === "PROMO") {
      const promo = activePromotions.get(p.id);
      return matchesSearch && !!promo && isPromoActiveToday(promo);
    }

    const matchesCategory = activeCategory === "Tous" || p.category === activeCategory;
    return matchesCategory && matchesSearch;
  });

  const quantityInCart = (productId: number) =>
    items.find((i) => i.product.id === productId)?.quantity ?? 0;

  return (
    <div style={{ paddingBottom: totalItems > 0 ? "90px" : 0 }}>
      <PageHeader
        icon={UtensilsCrossed}
        title="Menu produits"
        description="Composez le ticket en ajoutant des articles au panier."
      />

      {/* Search + category filters */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: colors.bgPage,
          paddingBottom: "16px",
          marginBottom: "4px",
        }}
      >
        <div style={{ position: "relative", marginBottom: "14px", maxWidth: "320px" }}>
          <Search
            size={16}
            color={colors.textMuted}
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              borderRadius: "10px",
              border: `1px solid ${colors.border}`,
              fontSize: "14px",
              boxSizing: "border-box",
              backgroundColor: "#fff",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {promoCount > 0 && (
            <button
              onClick={() => setActiveCategory(activeCategory === "PROMO" ? "Tous" : "PROMO")}
              style={{
                padding: "8px 18px",
                borderRadius: "999px",
                border: activeCategory === "PROMO" ? "none" : `1px solid ${colors.danger}`,
                backgroundColor: activeCategory === "PROMO" ? colors.danger : "#fff",
                color: activeCategory === "PROMO" ? "#fff" : colors.danger,
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              🔥 Today's Promo ({promoCount})
            </button>
          )}
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  border: isActive ? "none" : `1px solid ${colors.border}`,
                  backgroundColor: isActive ? colors.dark : "#fff",
                  color: isActive ? "#fff" : colors.dark,
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 2px 8px rgba(30,41,59,0.25)" : "none",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <MenuSkeleton />
      ) : filteredProducts.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            color: colors.textMuted,
          }}
        >
          <UtensilsCrossed size={32} style={{ marginBottom: "10px", opacity: 0.4 }} />
          <p>Aucun produit ne correspond a ta recherche.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredProducts.map((product) => {
            const qty = quantityInCart(product.id);
            const promotion = activePromotions.get(product.id);
            return (
              <div
                key={product.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "16px",
                  border: `1px solid ${colors.border}`,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  boxShadow: qty > 0 ? "0 4px 16px rgba(56,189,248,0.18)" : "0 1px 3px rgba(0,0,0,0.04)",
                  outline: qty > 0 ? `2px solid ${colors.accent}` : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    qty > 0 ? "0 4px 16px rgba(56,189,248,0.18)" : "0 1px 3px rgba(0,0,0,0.04)";
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: "100%",
                    height: 160,
                    position: "relative",
                    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                  }}
                >
                  {product.imageUrl ? (
                    <img
                      src={`http://localhost:3000${product.imageUrl}`}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const placeholder = e.currentTarget.nextElementSibling as HTMLElement | null;
                        if (placeholder) placeholder.style.display = "flex";
                      }}
                    />
                  ) : null}

                  <div
                    style={{
                      display: product.imageUrl ? "none" : "flex",
                      position: "absolute",
                      inset: 0,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <UtensilsCrossed size={30} color={colors.textMuted} />
                  </div>

                  {qty > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: colors.accent,
                        color: colors.dark,
                        borderRadius: "999px",
                        width: "26px",
                        height: "26px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                    >
                      {qty}
                    </div>
                  )}

                  <span
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                      backgroundColor: "rgba(15,23,42,0.75)",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      padding: "3px 9px",
                      borderRadius: "999px",
                    }}
                  >
                    {product.category}
                  </span>
                </div>

                {/* Info */}
                <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: colors.dark,
                      marginBottom: "6px",
                      lineHeight: 1.3,
                    }}
                  >
                    {product.name}
                  </div>
                  {promotion ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "14px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "13px",
                          color: colors.textMuted,
                          textDecoration: "line-through",
                        }}
                      >
                        {promotion.originalPrice} DT
                      </span>
                      <span style={{ fontSize: "18px", fontWeight: 700, color: colors.accentDark }}>
                        {product.price} DT
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#fff",
                          backgroundColor: colors.danger,
                          padding: "2px 7px",
                          borderRadius: "999px",
                        }}
                      >
                        -{promotion.discountPercentage}%
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: colors.accentDark,
                        marginBottom: "14px",
                      }}
                    >
                      {product.price} DT
                    </div>
                  )}

                  <div style={{ marginTop: "auto" }}>
                    {qty === 0 ? (
                      <button
                        onClick={() => addProduct(product)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "10px",
                          borderRadius: "10px",
                          border: "none",
                          backgroundColor: colors.dark,
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#334155")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.dark)}
                      >
                        <Plus size={15} />
                        Ajouter
                      </button>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: "#f1f5f9",
                          borderRadius: "10px",
                          padding: "4px",
                        }}
                      >
                        <button
                          onClick={() => decrementItem(product.id)}
                          style={stepperButtonStyle}
                        >
                          <Minus size={15} />
                        </button>
                        <span style={{ fontWeight: 700, color: colors.dark, fontSize: "14px" }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => incrementItem(product.id)}
                          style={stepperButtonStyle}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    )}
                  </div>
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
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkEnd} 100%)`,
            color: "#fff",
            borderRadius: "14px",
            padding: "14px 16px 14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                position: "relative",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCart size={16} />
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-6px",
                  backgroundColor: colors.accent,
                  color: colors.dark,
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: 700,
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 4px",
                }}
              >
                {totalItems}
              </span>
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: "13px", color: "#cbd5e1" }}>Total du panier</div>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>{totalAmount.toFixed(2)} DT</div>
            </div>
          </div>

          <button
            onClick={() => navigate("/franchise/tickets/new")}
            style={{
              backgroundColor: colors.accent,
              color: colors.dark,
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: "13px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Voir le ticket →
          </button>
        </div>
      )}
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
        gap: "20px",
      }}
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: "16px",
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ width: "100%", height: 160, backgroundColor: "#f1f5f9" }} />
          <div style={{ padding: "14px 16px" }}>
            <div style={{ height: "14px", width: "70%", backgroundColor: "#f1f5f9", borderRadius: "4px", marginBottom: "8px" }} />
            <div style={{ height: "18px", width: "40%", backgroundColor: "#f1f5f9", borderRadius: "4px", marginBottom: "14px" }} />
            <div style={{ height: "36px", width: "100%", backgroundColor: "#f1f5f9", borderRadius: "10px" }} />
          </div>
        </div>
      ))}
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
  padding: "6px 10px",
  borderRadius: "6px",
};

export default ProductMenu;