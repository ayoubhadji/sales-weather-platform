import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { SalesPrediction } from "../../types/SalesPrediction";
import type { Product } from "../../types/Product";
import type { Weather } from "../../types/Weather";
import PageHeader from "../../components/PageHeader";
import { card, colors, table, th, td, badge } from "../../styles/common";
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  X,
  Droplets,
  Wind,
  ImageOff,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

// Visual style (background/foreground colors + icon) per weather condition.
// Reused for both the date-group badge and the detail modal.
const CONDITION_STYLE: Record<
  string,
  { bg: string; fg: string; icon: typeof Sun }
> = {
  SUNNY: { bg: "#fef3c7", fg: "#b45309", icon: Sun },
  CLOUDY: { bg: "#e2e8f0", fg: "#475569", icon: Cloud },
  RAINY: { bg: "#dbeafe", fg: "#1d4ed8", icon: CloudRain },
  STORM: { bg: "#e0e7ff", fg: "#4338ca", icon: CloudLightning },
  FOG: { bg: "#f1f5f9", fg: "#64748b", icon: CloudFog },
};

// Falls back to the "Cloudy" style if the condition is missing/unrecognized,
// so the UI never breaks on unexpected data.
function getConditionStyle(condition?: string) {
  return CONDITION_STYLE[condition ?? ""] ?? CONDITION_STYLE.CLOUDY;
}

// Green/orange/red badge depending on how much we should trust a prediction.
// Thresholds mirror the confidence scale used by the backend heuristic and
// the Python ML service (both cap around 85%, so 70%+ is "as good as it gets").
function confidenceBadgeStyle(confidence: number) {
  if (confidence >= 70) return badge("#dcfce7", colors.success);
  if (confidence >= 45) return badge("#fef3c7", colors.warning);
  return badge("#fee2e2", colors.danger);
}

function Predictions() {
  const [predictions, setPredictions] = useState<SalesPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  // Which date's detail table is currently expanded (only one at a time).
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Product/Weather detail modals — set to open, null to close.
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<Weather | null>(null);

  // State for the "Check tomorrow's predictions" button.
  const [generating, setGenerating] = useState(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadPredictions();
  }, []);

  // Close any open modal on Escape, and lock page scroll while one is open
  // (otherwise the user could scroll the background behind the overlay).
  useEffect(() => {
    const hasModalOpen = !!selectedProduct || !!selectedWeather;
    if (!hasModalOpen) return;

    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProduct(null);
        setSelectedWeather(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProduct, selectedWeather]);

  async function loadPredictions() {
    try {
      const response = await api.get("/sales-predictions");
      setPredictions(response.data);
    } catch (error) {
      console.error("Error loading admin predictions:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Manual fallback for the nightly cron job. Calls the same endpoint the
   * cron uses, WITHOUT the `force` flag — the backend already checks
   * whether tomorrow's predictions exist before recomputing anything, so
   * this is always safe to click, even if the data is already up to date.
   * Useful if the app/server wasn't running when the 3 AM job would have run.
   */
  async function handleGenerateTomorrow() {
    setGenerating(true);
    setGenerateMessage(null);

    const beforeIds = new Set(predictions.map((p) => p.id));

    try {
      await api.get("/predictions/tomorrow-demand");
      await loadPredictions(); // refresh the table with any newly created rows

      setGenerateMessage(
        beforeIds.size === 0 ? "Predictions generated." : "Tomorrow's predictions are ready."
      );
    } catch (error) {
      console.error("Error generating tomorrow's predictions:", error);
      setGenerateMessage("Could not generate predictions — check the server.");
    } finally {
      setGenerating(false);
      setTimeout(() => setGenerateMessage(null), 4000); // auto-dismiss the message
    }
  }

  /**
   * Groups the flat list of predictions by predictionDate, and computes a
   * summary (total revenue/quantity, average confidence) per date. This is
   * what powers the "one card per date" layout instead of one giant table.
   * Recomputed only when `predictions` changes (useMemo), not on every render.
   */
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, SalesPrediction[]>();
    for (const prediction of predictions) {
      const list = groups.get(prediction.predictionDate) ?? [];
      list.push(prediction);
      groups.set(prediction.predictionDate, list);
    }
    return Array.from(groups.entries())
      .map(([date, items]) => {
        const totalRevenue = items.reduce((sum, p) => sum + Number(p.predictedRevenue), 0);
        const totalQuantity = items.reduce((sum, p) => sum + p.predictedQuantity, 0);
        const avgConfidence = items.reduce((sum, p) => sum + Number(p.confidence), 0) / items.length;
        return {
          date,
          items,
          // All predictions for the same date share the same weather record,
          // so the first item's weather represents the whole group.
          weather: items[0]?.weather,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalQuantity,
          avgConfidence: Math.round(avgConfidence),
          productCount: items.length,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // most recent date first
  }, [predictions]);

  return (
    <div>
      <style>{modalKeyframes}</style>

      <PageHeader
        icon={CloudSun}
        title="Sales Predictions"
        description="Review forecasted quantity, revenue and confidence values."
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {generateMessage && (
              <span style={{ fontSize: 13, color: colors.textMuted }}>{generateMessage}</span>
            )}
            <button
              onClick={handleGenerateTomorrow}
              disabled={generating}
              style={generateButtonStyle}
            >
              <RefreshCw size={14} className={generating ? "spin" : undefined} />
              {generating ? "Checking..." : "Check tomorrow's predictions"}
            </button>
          </div>
        }
      />

      {/* One card per date, sorted newest first */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div style={card}>
            <p style={{ color: colors.textMuted, margin: 0 }}>Loading predictions...</p>
          </div>
        ) : groupedByDate.length === 0 ? (
          <div style={card}>
            <p style={{ color: colors.textMuted, margin: 0 }}>No predictions found.</p>
          </div>
        ) : (
          groupedByDate.map((group) => {
            const isOpen = expandedDate === group.date;
            const conditionStyle = getConditionStyle(group.weather?.weatherCondition);
            const ConditionIcon = conditionStyle.icon;

            return (
              <div key={group.date} style={{ ...card, padding: 0, overflow: "hidden" }}>
                {/* Date summary row — click anywhere on it to expand/collapse */}
                <button
                  onClick={() => setExpandedDate(isOpen ? null : group.date)}
                  style={dateSummaryButtonStyle}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span style={{ fontWeight: 700, color: colors.dark, fontSize: 15 }}>
                      {group.date}
                    </span>
                    {group.weather && (
                      // stopPropagation so clicking the weather badge opens the
                      // weather modal WITHOUT also toggling the date row below it
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWeather(group.weather);
                        }}
                        style={{
                          ...badge(conditionStyle.bg, conditionStyle.fg),
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                        }}
                      >
                        <ConditionIcon size={12} />
                        {group.weather.weatherCondition}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <SummaryStat label="Products" value={group.productCount} />
                    <SummaryStat label="Qty" value={group.totalQuantity} />
                    <SummaryStat label="Revenue" value={`${group.totalRevenue} DT`} />
                    <span style={confidenceBadgeStyle(group.avgConfidence)}>
                      {group.avgConfidence}%
                    </span>
                  </div>
                </button>

                {/* Expanded per-product detail table for this date only */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${colors.border}` }}>
                    <table style={table}>
                      <thead>
                        <tr>
                          <th style={th}>ID</th>
                          <th style={th}>Product</th>
                          <th style={th}>Predicted Quantity</th>
                          <th style={th}>Predicted Revenue</th>
                          <th style={th}>Confidence</th>
                          <th style={th}>Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((prediction, i) => (
                          <tr
                            key={prediction.id}
                            style={{ backgroundColor: i % 2 === 1 ? "#f8fafc" : "#fff" }}
                          >
                            <td style={td}>{prediction.id}</td>
                            <td style={td}>
                              {prediction.product ? (
                                <button
                                  onClick={() => setSelectedProduct(prediction.product)}
                                  className="link-btn"
                                >
                                  {prediction.product.name}
                                </button>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td style={td}>{prediction.predictedQuantity}</td>
                            <td style={{ ...td, fontWeight: 700 }}>
                              {prediction.predictedRevenue} DT
                            </td>
                            <td style={td}>
                              <span style={confidenceBadgeStyle(prediction.confidence)}>
                                {prediction.confidence}%
                              </span>
                            </td>
                            <td style={td}>
                              {/* "ml" = came from the trained Python model,
                                  "heuristic" = rule-based fallback was used instead */}
                              {prediction.method === "ml" ? (
                                <span style={badge("#ede9fe", "#6d28d9")}>🐍 ML</span>
                              ) : (
                                <span style={badge("#f1f5f9", colors.textMuted)}>📐 Heuristic</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Product detail modal */}
      {selectedProduct && (
        <div style={overlayStyle} onClick={() => setSelectedProduct(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedProduct(null)}
              style={closeButtonStyle}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Solid background behind the image so a transparent PNG never
                shows through unexpectedly */}
            <div
              style={{
                width: "100%",
                height: 180,
                borderRadius: 12,
                overflow: "hidden",
                backgroundColor: "#f1f5f9",
                marginBottom: 18,
                position: "relative",
                border: `1px solid ${colors.border}`,
              }}
            >
              {selectedProduct.imageUrl ? (
                <img
                  src={`http://localhost:3000${selectedProduct.imageUrl}`}
                  alt={selectedProduct.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    backgroundColor: "#f1f5f9",
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.textMuted,
                  }}
                >
                  <ImageOff size={26} />
                </div>
              )}
            </div>

            <span
              style={{
                ...badge("#f1f5f9", colors.textMuted),
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontSize: 11,
              }}
            >
              {selectedProduct.category}
            </span>
            <h2 style={{ margin: "10px 0 4px", fontSize: 20, color: colors.dark }}>
              {selectedProduct.name}
            </h2>
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14 }}>
              Product ID #{selectedProduct.id}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: colors.accentDark,
                paddingTop: 14,
                borderTop: `1px solid ${colors.border}`,
              }}
            >
              {selectedProduct.price} DT
            </div>
          </div>
        </div>
      )}

      {/* Weather detail modal */}
      {selectedWeather && (
        <div style={overlayStyle} onClick={() => setSelectedWeather(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedWeather(null)}
              style={closeButtonStyle}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* IIFE so we can compute conditionStyle/ConditionIcon once,
                right where they're used, without polluting component scope */}
            {(() => {
              const conditionStyle = getConditionStyle(selectedWeather.weatherCondition);
              const ConditionIcon = conditionStyle.icon;
              return (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        backgroundColor: conditionStyle.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ConditionIcon size={24} color={conditionStyle.fg} />
                    </div>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: colors.dark }}>
                        {selectedWeather.temperature}°C
                      </div>
                      <div style={{ fontSize: 13, color: colors.textMuted }}>
                        {selectedWeather.weatherCondition} · {selectedWeather.weatherDate}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={weatherMetricStyle}>
                      <Droplets size={16} color={colors.textMuted} />
                      <div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>Humidity</div>
                        <div style={{ fontWeight: 700, color: colors.dark }}>
                          {selectedWeather.humidity}%
                        </div>
                      </div>
                    </div>
                    <div style={weatherMetricStyle}>
                      <Wind size={16} color={colors.textMuted} />
                      <div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>Wind speed</div>
                        <div style={{ fontWeight: 700, color: colors.dark }}>
                          {selectedWeather.windSpeed} km/h
                        </div>
                      </div>
                    </div>
                    <div style={weatherMetricStyle}>
                      <CloudRain size={16} color={colors.textMuted} />
                      <div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>Rainfall</div>
                        <div style={{ fontWeight: 700, color: colors.dark }}>
                          {selectedWeather.rainfall} mm
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// Small right-aligned label/value pair used in the date summary row
// (Products / Qty / Revenue).
function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontSize: 10, color: colors.textMuted, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: colors.dark }}>{value}</div>
    </div>
  );
}

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
  width: 380,
  maxWidth: "calc(100vw - 32px)",
  background: "#fff",
  borderRadius: 18,
  padding: 24,
  position: "relative",
  boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
  animation: "modalPopIn 0.18s ease",
};

const closeButtonStyle: React.CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
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

const weatherMetricStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 12,
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  backgroundColor: "#f8fafc",
};

const dateSummaryButtonStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  padding: "16px 20px",
  background: "#fff",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  flexWrap: "wrap",
};

const generateButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 16px",
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  background: "#fff",
  color: colors.dark,
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

// Injected once via a <style> tag (rather than separate CSS files) so this
// component stays self-contained. Covers modal enter animations, the
// underline-on-hover product links, and the spinning refresh icon.
const modalKeyframes = `
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes modalPopIn {
  from { opacity: 0; transform: scale(0.96) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: ${colors.dark};
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: ${colors.border};
  text-underline-offset: 3px;
}
.link-btn:hover {
  color: ${colors.accentDark};
  text-decoration-color: ${colors.accentDark};
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

export default Predictions;