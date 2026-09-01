import { useEffect, useState } from "react";
import { Leaf, TrendingDown, DollarSign, Calendar, Info } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import api from "../../services/api";
import { card, primaryButton } from "../../styles/common";
import type { WasteAvoidanceKPI, TimelinePoint, ProductBreakdown } from "../../types/Sustainability";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

function Sustainability() {
  const [kpi, setKpi] = useState<WasteAvoidanceKPI>({
    totalWasteKg: 0,
    totalWasteValue: 0,
    reductionPercentage: 0,
    periodDays: 0,
    productsAnalyzed: 0,
    forecastAccuracy: 0,
  });

  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [products, setProducts] = useState<ProductBreakdown[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadSustainability();
  }, []);

  async function loadSustainability() {
    setLoading(true);
    try {
      await Promise.all([
        loadKPI(),
        loadTimeline(),
        loadProducts(),
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function loadKPI() {
    try {
      const response = await api.get("/reports/sustainability/summary", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setKpi(response.data);
    } catch (error) {
      console.error("Error loading sustainability KPI:", error);
    }
  }

  async function loadTimeline() {
    try {
      const response = await api.get("/reports/sustainability/timeline", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setTimeline(response.data);
    } catch (error) {
      console.error("Error loading sustainability timeline:", error);
    }
  }

  async function loadProducts() {
    try {
      const response = await api.get("/reports/sustainability/products", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error loading product breakdown:", error);
    }
  }

  function handleApplyFilters() {
    void loadSustainability();
  }

  function resetFilters() {
    setStartDate("");
    setEndDate("");
  }

  return (
    <div>
      <PageHeader
        icon={Leaf}
        title="Sustainability Dashboard"
        description="Track food waste avoidance through improved demand forecasting."
      />

      {/* Filters */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={filterGrid}>
          <div>
            <label style={labelStyle}>From</label>
            <input
              type="date"
              style={inputStyle}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>To</label>
            <input
              type="date"
              style={inputStyle}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <button
              onClick={handleApplyFilters}
              style={primaryButton}
              disabled={loading}
            >
              {loading ? "Loading..." : "Apply Filters"}
            </button>
            <button
              onClick={resetFilters}
              style={{
                padding: "8px 16px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                background: "#f9fafb",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={gridStyle}>
        <KPICard
          icon={Leaf}
          label="Waste Avoided (kg)"
          value={kpi.totalWasteKg}
          unit="kg"
          accent="#16a34a"
        />
        <KPICard
          icon={DollarSign}
          label="Economic Value"
          value={kpi.totalWasteValue}
          unit="DT"
          accent="#2563eb"
        />
        <KPICard
          icon={TrendingDown}
          label="Reduction %"
          value={kpi.productsAnalyzed > 0 ? 
            Math.round((kpi.totalWasteKg / (kpi.totalWasteKg + 100)) * 100) : 0
          }
          unit="%"
          accent="#f59e0b"
        />
        <KPICard
          icon={Calendar}
          label="Analysis Period"
          value={kpi.periodDays}
          unit="days"
          accent="#8b5cf6"
        />
      </div>

      {/* Waste Timeline Chart */}
      <div style={{ ...card, marginTop: 24, marginBottom: 24 }}>
        <h2 style={chartTitleStyle}>Waste Avoidance Timeline</h2>
        {timeline.length === 0 ? (
          <div style={emptyStateStyle}>No data available for selected period</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb" }}
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(2) : value
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="wasteAvoidedKg"
                stroke="#16a34a"
                strokeWidth={2}
                name="Waste Avoided (kg)"
                dot={{ fill: "#16a34a", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="wasteAvoidedValue"
                stroke="#2563eb"
                strokeWidth={2}
                name="Economic Value (DT)"
                dot={{ fill: "#2563eb", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Product Breakdown Chart */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h2 style={chartTitleStyle}>Top Products by Waste Avoidance</h2>
        {products.length === 0 ? (
          <div style={emptyStateStyle}>No product data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={products.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="productName" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb" }}
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(2) : value
                }
              />
              <Legend />
              <Bar dataKey="wasteAvoidedKg" fill="#16a34a" name="Waste Avoided (kg)" />
              <Bar dataKey="wasteAvoidedValue" fill="#2563eb" name="Economic Value (DT)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Product Breakdown Table */}
      <div style={{ ...card, marginBottom: 24 }}>
        <h2 style={chartTitleStyle}>Detailed Product Analysis</h2>
        {products.length === 0 ? (
          <div style={emptyStateStyle}>No product data available</div>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={tableCellStyle}>Product</th>
                  <th style={tableCellStyle}>Category</th>
                  <th style={tableCellStyle}>Baseline Qty</th>
                  <th style={tableCellStyle}>Forecast Qty</th>
                  <th style={tableCellStyle}>Waste Avoided (kg)</th>
                  <th style={tableCellStyle}>Economic Value (DT)</th>
                  <th style={tableCellStyle}>Reduction %</th>
                  <th style={tableCellStyle}>Forecast Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.productId} style={tableRowStyle}>
                    <td style={tableCellStyle}>{product.productName}</td>
                    <td style={tableCellStyle}>{product.category}</td>
                    <td style={tableCellStyle}>{product.baselineQuantity.toFixed(2)}</td>
                    <td style={tableCellStyle}>{product.forecastQuantity.toFixed(2)}</td>
                    <td style={tableCellStyle}>
                      <strong style={{ color: "#16a34a" }}>
                        {product.wasteAvoidedKg.toFixed(2)}
                      </strong>
                    </td>
                    <td style={tableCellStyle}>
                      <strong style={{ color: "#2563eb" }}>
                        {product.wasteAvoidedValue.toFixed(2)}
                      </strong>
                    </td>
                    <td style={tableCellStyle}>
                      {product.reductionPercentage.toFixed(1)}%
                    </td>
                    <td style={tableCellStyle}>
                      {product.forecastAccuracy.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Methodology Section */}
      <div style={{ ...card, background: "#f0fdf4", borderLeft: "4px solid #16a34a" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Info size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 style={{ margin: "0 0 8px 0", color: "#166534", fontWeight: 600 }}>
              Methodology
            </h3>
            <p style={{ margin: "0 0 8px 0", color: "#166534", fontSize: 14, lineHeight: 1.5 }}>
              <strong>Waste Avoidance Estimation:</strong> This dashboard estimates food waste 
              avoided through improved demand forecasting. The calculation compares the historical 
              average sales quantity (baseline) against ML-predicted quantities for each product.
            </p>
            <p style={{ margin: "0 0 8px 0", color: "#166534", fontSize: 14, lineHeight: 1.5 }}>
              <strong>Waste Avoided (kg):</strong> max(0, baseline - forecast quantity). 
              Assumes 1kg per unit. Represents how much less preparation would be needed 
              if forecasts were used instead of averages.
            </p>
            <p style={{ margin: "0 0 8px 0", color: "#166534", fontSize: 14, lineHeight: 1.5 }}>
              <strong>Economic Value:</strong> Waste avoided quantity × product selling price. 
              Used as proxy since production cost data is not tracked.
            </p>
            <p style={{ margin: "0 0 0 0", color: "#166534", fontSize: 14, lineHeight: 1.5 }}>
              <strong>Forecast Accuracy:</strong> Average confidence score of predictions used 
              (0-100%). Higher values indicate more reliable estimates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  value: number;
  unit: string;
  accent: string;
}) {
  return (
    <div style={kpiCardStyle}>
      <div style={{ ...iconBadgeStyle, background: `${accent}17`, color: accent }}>
        <Icon size={20} />
      </div>
      <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 600, marginTop: 12 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#12181f" }}>
          {value.toFixed(2)}
        </div>
        <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600 }}>{unit}</div>
      </div>
    </div>
  );
}

const filterGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 16,
  alignItems: "flex-end",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 6,
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "inherit",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 16,
  marginTop: 24,
};

const kpiCardStyle: React.CSSProperties = {
  ...card,
  padding: 20,
};

const iconBadgeStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 16,
  color: "#12181f",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "32px 16px",
  textAlign: "center",
  color: "#94a3b8",
};

const tableContainerStyle: React.CSSProperties = {
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const tableHeaderStyle: React.CSSProperties = {
  background: "#f9fafb",
  borderBottom: "2px solid #e5e7eb",
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px 8px",
  textAlign: "left",
  fontSize: 14,
  borderBottom: "1px solid #e5e7eb",
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
};

export default Sustainability;
