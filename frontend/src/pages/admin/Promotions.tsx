import { useEffect, useMemo, useState } from "react";
import { Tag, Percent, Calendar, PackageSearch, Sparkles, Loader2 } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import api from "../../services/api";
import { card, colors } from "../../styles/common";
import type { Promotion } from "../../types/Promotion";

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

  // Placeholder state for the future "suggested promotions for tomorrow"
  // feature. Not wired to a real endpoint yet.
  const [suggestions, setSuggestions] = useState<SuggestedPromotion[] | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    void loadPromotions();
  }, []);

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
      <PageHeader
        icon={Tag}
        title="Promotions"
        description="Track active discounts and the reasons behind each campaign."
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((promotion) => {
                const statusInfo = STATUS_STYLES[promotion.status];
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
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
          : "Promotions you create will show up here."}
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

export default Promotions;