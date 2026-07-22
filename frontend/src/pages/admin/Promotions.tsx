import { useEffect, useMemo, useState } from "react";
import {
  Tag,
  Percent,
  Calendar,
  PackageSearch,
  Sparkles,
  Loader2,
  Plus,
  X,
  Zap,
  Undo2,
  CheckCircle2,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import api from "../../services/api";
import { card, colors, primaryButton } from "../../styles/common";
import type { Promotion } from "../../types/Promotion";
import type { Product } from "../../types/Product";

type Status = "upcoming" | "active" | "expired";

// Shape for the future "recommend promotions for tomorrow" feature.
// Adjust once the real endpoint/response is defined.
type SuggestedPromotion = {
  productId: number;
  productName: string;
  suggestedDiscount: number;
  reason: string;
};

const STATUS_STYLES: Record<Status, { label: string; bg: string; color: string }> = {
  active: { label: "Active", bg: "#16a34a1a", color: "#16a34a" },
  upcoming: { label: "Upcoming", bg: "#2563eb1a", color: "#2563eb" },
  expired: { label: "Expired", bg: "#6b72801a", color: "#6b7280" },
};

function getStatus(startDate: string, endDate: string): Status {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "upcoming";
  if (now > end) return "expired";
  return "active";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  // "Add Promotion" modal state
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductId, setNewProductId] = useState("");
  const [newDiscount, setNewDiscount] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Per-row apply/revert loading state (by promotion id)
  const [applyingId, setApplyingId] = useState<number | null>(null);

  // Placeholder state for the future "suggested promotions for tomorrow"
  // feature. Not wired to a real endpoint yet.
  const [suggestions, setSuggestions] = useState<SuggestedPromotion[] | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    void loadPromotions();
    void loadProducts();
  }, []);

  // Lock page scroll + close on Escape while the Add modal is open
  useEffect(() => {
    if (!showAddModal) return;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowAddModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAddModal]);

  async function loadPromotions() {
    try {
      const response = await api.get("/promotions");
      setPromotions(response.data);
    } catch (error) {
      console.error("Error loading admin promotions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading products for promotion form:", error);
    }
  }

  function openAddModal() {
    setNewProductId("");
    setNewDiscount("");
    setNewReason("");
    setNewStartDate("");
    setNewEndDate("");
    setSaveError("");
    setShowAddModal(true);
  }

  async function handleCreatePromotion(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);

    try {
      await api.post("/promotions", {
        productId: Number(newProductId),
        discountPercentage: Number(newDiscount),
        reason: newReason,
        startDate: newStartDate,
        endDate: newEndDate,
      });

      setShowAddModal(false);
      await loadPromotions();
    } catch (error) {
      console.error("Error creating promotion:", error);
      setSaveError("Could not create the promotion. Check the fields and try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApply(promotion: Promotion) {
    setApplyingId(promotion.id);
    try {
      await api.post(`/promotions/${promotion.id}/apply`);
      await loadPromotions();
    } catch (error) {
      console.error("Error applying promotion:", error);
      window.alert("Could not apply this promotion — it may already be applied.");
    } finally {
      setApplyingId(null);
    }
  }

  async function handleRevert(promotion: Promotion) {
    setApplyingId(promotion.id);
    try {
      await api.post(`/promotions/${promotion.id}/revert`);
      await loadPromotions();
    } catch (error) {
      console.error("Error reverting promotion:", error);
      window.alert("Could not revert this promotion.");
    } finally {
      setApplyingId(null);
    }
  }

  // TODO: wire this up once the "recommend promotions for tomorrow" endpoint
  // exists (e.g. GET/POST /promotions/suggestions or similar, likely backed
  // by sales-predictions). For now this just simulates the call so the UI
  // below is ready to go the moment the real endpoint lands.
  async function loadSuggestions() {
    setSuggestionsLoading(true);
    try {
      // const response = await api.get("/promotions/suggestions");
      // setSuggestions(response.data);
      setSuggestions([]); // placeholder — replace with the line above
    } catch (error) {
      console.error("Error loading promotion suggestions:", error);
    } finally {
      setSuggestionsLoading(false);
    }
  }

  const withStatus = useMemo(
    () =>
      promotions.map((promotion) => ({
        ...promotion,
        status: getStatus(promotion.startDate, promotion.endDate),
      })),
    [promotions],
  );

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? withStatus
        : withStatus.filter((p) => p.status === statusFilter),
    [withStatus, statusFilter],
  );

  const counts = useMemo(() => {
    const result = { active: 0, upcoming: 0, expired: 0 };
    withStatus.forEach((p) => result[p.status]++);
    return result;
  }, [withStatus]);

  return (
    <div>
      <style>{modalKeyframes}</style>

      <PageHeader
        icon={Tag}
        title="Promotions"
        description="Track active discounts and the reasons behind each campaign."
        action={
          <button style={{ ...primaryButton, display: "flex", alignItems: "center", gap: 8 }} onClick={openAddModal}>
            <Plus size={16} />
            Add Promotion
          </button>
        }
      />

      {/* Summary cards */}
      <div style={summaryGrid}>
        <SummaryCard
          label="Active"
          count={counts.active}
          accent="#16a34a"
          selected={statusFilter === "active"}
          onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
        />
        <SummaryCard
          label="Upcoming"
          count={counts.upcoming}
          accent="#2563eb"
          selected={statusFilter === "upcoming"}
          onClick={() => setStatusFilter(statusFilter === "upcoming" ? "all" : "upcoming")}
        />
        <SummaryCard
          label="Expired"
          count={counts.expired}
          accent="#6b7280"
          selected={statusFilter === "expired"}
          onClick={() => setStatusFilter(statusFilter === "expired" ? "all" : "expired")}
        />
      </div>

      {/* Suggested promotions for tomorrow — placeholder, not wired up yet */}
      <div style={{ ...card, ...suggestCard }}>
        <div style={suggestHeader}>
          <div style={suggestHeaderLeft}>
            <div style={suggestIconWrap}>
              <Sparkles size={20} color="#7c3aed" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Suggested Promotions for Tomorrow</h3>
              <p style={suggestSubtitle}>
                Recommendations based on predicted sales. Coming soon.
              </p>
            </div>
          </div>

          <button
            style={{
              ...suggestButton,
              opacity: suggestionsLoading ? 0.75 : 1,
            }}
            onClick={loadSuggestions}
            disabled={suggestionsLoading}
            title="Not wired up yet"
          >
            {suggestionsLoading ? (
              <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
            ) : (
              <Sparkles size={16} />
            )}
            {suggestionsLoading ? "Analyzing…" : "Get suggestions"}
          </button>
        </div>

        {suggestions && suggestions.length > 0 ? (
          <div style={suggestResultBox}>
            {suggestions.map((s) => (
              <div key={s.productId} style={suggestRow}>
                <span style={{ fontWeight: 600, color: colors.dark }}>{s.productName}</span>
                <span style={discountPill}>
                  <Percent size={12} />
                  {s.suggestedDiscount}%
                </span>
                <span style={{ color: colors.textMuted, fontSize: 13 }}>{s.reason}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={suggestEmptyHint}>
            This section will suggest which products to discount tomorrow based on predicted
            sales, once connected to the predictions engine.
          </p>
        )}
      </div>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        {loading ? (
          <LoadingRows />
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={statusFilter !== "all"} />
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Discount</th>
                <th style={thStyle}>Reason</th>
                <th style={thStyle}>Start Date</th>
                <th style={thStyle}>End Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((promotion) => {
                const statusInfo = STATUS_STYLES[promotion.status];
                const isApplying = applyingId === promotion.id;

                return (
                  <tr key={promotion.id} style={rowStyle}>
                    <td style={tdStyle}>
                      <div style={productCell}>
                        <div style={productIconWrap}>
                          <PackageSearch size={16} color={colors.textMuted} />
                        </div>
                        {promotion.product?.name ?? "—"}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={discountPill}>
                        <Percent size={12} />
                        {promotion.discountPercentage}%
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: colors.textMuted }}>
                      {promotion.reason || "—"}
                    </td>
                    <td style={tdStyle}>
                      <span style={dateCell}>
                        <Calendar size={13} color={colors.textMuted} />
                        {formatDate(promotion.startDate)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={dateCell}>
                        <Calendar size={13} color={colors.textMuted} />
                        {formatDate(promotion.endDate)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          ...statusBadge,
                          background: statusInfo.bg,
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {promotion.applied ? (
                        <button
                          onClick={() => handleRevert(promotion)}
                          disabled={isApplying}
                          style={revertButtonStyle}
                        >
                          {isApplying ? (
                            <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                          ) : (
                            <Undo2 size={14} />
                          )}
                          Revert
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(promotion)}
                          disabled={isApplying}
                          style={applyButtonStyle}
                        >
                          {isApplying ? (
                            <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                          ) : (
                            <Zap size={14} />
                          )}
                          Apply
                        </button>
                      )}
                      {promotion.applied && (
                        <span style={appliedHint}>
                          <CheckCircle2 size={12} />
                          Applied
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Promotion modal */}
      {showAddModal && (
        <div style={overlayStyle} onClick={() => setShowAddModal(false)}>
          <form
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreatePromotion}
          >
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={closeButtonStyle}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h2 style={{ margin: "0 0 20px", fontSize: 19, color: colors.dark }}>
              Add Promotion
            </h2>

            <div style={{ display: "grid", gap: 14 }}>
              <label style={fieldLabelStyle}>
                Product
                <select
                  value={newProductId}
                  onChange={(e) => setNewProductId(e.target.value)}
                  style={fieldInputStyle}
                  required
                >
                  <option value="" disabled>
                    Select a product...
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.price} DT
                    </option>
                  ))}
                </select>
              </label>

              <label style={fieldLabelStyle}>
                Discount (%)
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  style={fieldInputStyle}
                  required
                />
              </label>

              <label style={fieldLabelStyle}>
                Reason
                <input
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  style={fieldInputStyle}
                  placeholder="e.g. High temperature expected"
                  required
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label style={fieldLabelStyle}>
                  Start date
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    style={fieldInputStyle}
                    required
                  />
                </label>
                <label style={fieldLabelStyle}>
                  End date
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    style={fieldInputStyle}
                    required
                  />
                </label>
              </div>
            </div>

            {saveError && (
              <p style={{ color: colors.danger, fontSize: 13, marginTop: 14 }}>{saveError}</p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: `1px solid ${colors.border}`,
                  background: "#fff",
                  color: colors.dark,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button type="submit" style={primaryButton} disabled={saving}>
                {saving ? "Saving..." : "Create promotion"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  count,
  accent,
  selected,
  onClick,
}: {
  label: string;
  count: number;
  accent: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...card,
        ...summaryCard,
        border: selected ? `2px solid ${accent}` : `1px solid ${colors.border}`,
      }}
    >
      <span style={{ ...summaryDot, background: accent }} />
      <div style={{ textAlign: "left" }}>
        <div style={summaryLabel}>{label}</div>
        <div style={{ ...summaryCount, color: colors.dark }}>{count}</div>
      </div>
    </button>
  );
}

function LoadingRows() {
  return (
    <div style={{ padding: 24 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={skeletonRow(i)} />
      ))}
    </div>
  );
}

function skeletonRow(index: number): React.CSSProperties {
  return {
    height: 44,
    borderRadius: 8,
    background: "#f1f5f9",
    marginBottom: 12,
    opacity: 1 - index * 0.15,
  };
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div style={emptyState}>
      <Tag size={32} color={colors.textMuted} />
      <p style={{ margin: 0, fontWeight: 600, color: colors.dark }}>
        {hasFilter ? "No promotions match this filter" : "No promotions found"}
      </p>
      <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>
        {hasFilter
          ? "Try selecting a different status above."
          : "Click \"Add Promotion\" to create your first one."}
      </p>
    </div>
  );
}

const summaryGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 16,
  margin: "20px 0 24px",
};

const summaryCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  cursor: "pointer",
  textAlign: "left",
  font: "inherit",
};

const summaryDot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  flexShrink: 0,
};

const summaryLabel: React.CSSProperties = {
  fontSize: 13,
  color: "#64748b",
};

const summaryCount: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  marginTop: 2,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  background: "#f8fafc",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: 13,
  color: colors.textMuted,
  fontWeight: 600,
};

const rowStyle: React.CSSProperties = {
  transition: "background 0.15s ease",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: 14,
};

const productCell: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 600,
  color: colors.dark,
};

const productIconWrap: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 8,
  background: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const discountPill: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontWeight: 700,
  color: "#f59e0b",
  background: "#f59e0b1a",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 13,
};

const dateCell: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  color: colors.dark,
  fontSize: 13,
};

const statusBadge: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const emptyState: React.CSSProperties = {
  padding: "48px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  textAlign: "center",
};

const suggestCard: React.CSSProperties = {
  marginBottom: 24,
};

const suggestHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const suggestHeaderLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const suggestIconWrap: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#7c3aed1a",
  flexShrink: 0,
};

const suggestSubtitle: React.CSSProperties = {
  margin: 0,
  marginTop: 2,
  fontSize: 13,
  color: colors.textMuted,
};

const suggestButton: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: "#0f172a",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  flexShrink: 0,
};

const suggestEmptyHint: React.CSSProperties = {
  marginTop: 16,
  marginBottom: 0,
  fontSize: 13,
  color: colors.textMuted,
};

const suggestResultBox: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 18,
  borderTop: `1px solid ${colors.border}`,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const suggestRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontSize: 14,
};

/* --- Apply/Revert button styles --- */

const applyButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 12px",
  borderRadius: 8,
  border: "none",
  background: colors.dark,
  color: "#fff",
  fontWeight: 600,
  fontSize: 12,
  cursor: "pointer",
};

const revertButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 12px",
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  background: "#fff",
  color: colors.dark,
  fontWeight: 600,
  fontSize: 12,
  cursor: "pointer",
};

const appliedHint: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  marginLeft: 8,
  fontSize: 11,
  color: colors.success,
  fontWeight: 600,
};

/* --- Add Promotion modal styles --- */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.5)",
  backdropFilter: "blur(3px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  animation: "overlayFadeIn 0.15s ease",
};

const modalStyle: React.CSSProperties = {
  width: 440,
  maxWidth: "calc(100vw - 32px)",
  background: "#fff",
  borderRadius: 18,
  padding: 26,
  position: "relative",
  boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
  animation: "modalPopIn 0.18s ease",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "none",
  background: "#f1f5f9",
  color: colors.dark,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: colors.dark,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const fieldInputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  fontSize: 14,
  fontWeight: 400,
  color: colors.dark,
  outline: "none",
};

const modalKeyframes = `
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modalPopIn {
  from { opacity: 0; transform: scale(0.96) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
`;

export default Promotions;