import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  FileDown,
  TrendingUp,
  Ticket,
  Calculator,
  Package,
  RotateCcw,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import api from "../../services/api";
import { card, colors, primaryButton } from "../../styles/common";
import type { FranchiseStats } from "../../types/FranchiseStats";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Pie,
  PieChart,
  Cell,
  Legend,
} from "recharts";

type ReportSummary = {
  revenue: number;
  tickets: number;
  averageTicket: number;
  topProduct: string;
};

type AiAdvice = {
  headline: string;
  recommendations: string[];
};

const PIE_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

function Reports() {
  const [summary, setSummary] = useState<ReportSummary>({
    revenue: 0,
    tickets: 0,
    averageTicket: 0,
    topProduct: "—",
  });
  const [franchises, setFranchises] = useState<FranchiseStats[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [revenueTrend, setRevenueTrend] = useState<
    { date: string; revenue: number }[]
  >([]);
  const [categorySales, setCategorySales] = useState<
    { category: string; sales: number }[]
  >([]);

  const [aiAdvice, setAiAdvice] = useState<AiAdvice | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    loadAll();
    loadFranchises();
  }, []);

  const hasActiveFilters = Boolean(startDate || endDate || selectedFranchise);

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([loadSummary(), loadRevenueTrend(), loadCategorySales()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSummary() {
    try {
      const response = await api.get("/reports/summary", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          franchiseId: selectedFranchise || undefined,
        },
      });
      setSummary(response.data);
    } catch (error) {
      console.error("Error loading report summary:", error);
    }
  }

  async function loadFranchises() {
    try {
      const response = await api.get("/users/franchises");
      setFranchises(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadRevenueTrend() {
    try {
      const response = await api.get("/reports/revenue-trend", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          franchiseId: selectedFranchise || undefined,
        },
      });
      setRevenueTrend(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadCategorySales() {
    try {
      const response = await api.get("/reports/category-sales", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          franchiseId: selectedFranchise || undefined,
        },
      });
      setCategorySales(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  function resetFilters() {
    setStartDate("");
    setEndDate("");
    setSelectedFranchise("");
  }

  async function getAiAdvice() {
    setAiLoading(true);
    setAiError("");
    try {
      const franchiseName =
        franchises.find((f) => String(f.id) === selectedFranchise)?.name ||
        "All franchises";

      const response = await api.post("/reports/ai-advice", {
        summary,
        revenueTrend,
        categorySales,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        franchiseName,
      });

      setAiAdvice(response.data);
    } catch (error) {
      console.error("Error getting AI advice:", error);
      setAiError("Could not generate advice right now. Try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  }

  const rangeLabel = useMemo(() => {
    if (!startDate && !endDate) return "All time";
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    if (startDate && endDate) return `${fmt(startDate)} – ${fmt(endDate)}`;
    if (startDate) return `From ${fmt(startDate)}`;
    return `Until ${fmt(endDate)}`;
  }, [startDate, endDate]);

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="Analytics & Reports"
        description="Generate business reports and export sales insights."
      />

      {/* Filters */}
      <div style={{ ...card, ...filterCard }}>
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

          <div>
            <label style={labelStyle}>Franchise</label>
            <select
              style={inputStyle}
              value={selectedFranchise}
              onChange={(e) => setSelectedFranchise(e.target.value)}
            >
              <option value="">All Franchises</option>
              {franchises.map((franchise) => (
                <option key={franchise.id} value={franchise.id}>
                  {franchise.name}
                </option>
              ))}
            </select>
          </div>

          <div style={actionsCol}>
            <button
              style={{
                ...primaryButton,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: loading ? 0.75 : 1,
              }}
              onClick={loadAll}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={16} className="spin" style={{ animation: "spin 0.8s linear infinite" }} />
              ) : (
                <BarChart3 size={16} />
              )}
              {loading ? "Generating…" : "Generate Report"}
            </button>
          </div>
        </div>

        <div style={filterFooter}>
          <span style={rangePill}>{rangeLabel}</span>
          {hasActiveFilters && (
            <button style={ghostButton} onClick={resetFilters}>
              <RotateCcw size={14} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={kpiGrid}>
        <StatCard
          title="Revenue"
          value={`${summary.revenue.toFixed(2)} DT`}
          icon={TrendingUp}
          accent="#2563eb"
        />
        <StatCard
          title="Tickets"
          value={summary.tickets.toString()}
          icon={Ticket}
          accent="#16a34a"
        />
        <StatCard
          title="Average Ticket"
          value={`${summary.averageTicket.toFixed(2)} DT`}
          icon={Calculator}
          accent="#f59e0b"
        />
        <StatCard
          title="Top Product"
          value={summary.topProduct}
          icon={Package}
          accent="#8b5cf6"
        />
      </div>

      {/* Charts */}
      <div style={chartsGrid}>
        <div style={{ ...card, ...chartCard }}>
          <h3 style={chartTitle}>Revenue Trend</h3>

          {revenueTrend.length === 0 ? (
            <EmptyChartState label="No revenue data for this period" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(2)} DT`, "Revenue"]}
                  labelFormatter={(label) =>
                    new Date(String(label)).toLocaleDateString("en-GB")
                  }
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                  }}
                />
                <Line
                  type="natural"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ ...card, ...chartCard }}>
          <h3 style={chartTitle}>Sales by Category</h3>

          {categorySales.length === 0 ? (
            <EmptyChartState label="No category data for this period" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categorySales}
                  dataKey="sales"
                  nameKey="category"
                  outerRadius={90}
                  label
                >
                  {categorySales.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: `1px solid ${colors.border}`,
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* AI Advisor */}
      <div style={{ ...card, ...aiCard }}>
        <div style={aiHeader}>
          <div style={aiHeaderLeft}>
            <div style={aiIconWrap}>
              <Sparkles size={20} color="#7c3aed" />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>AI Business Advisor</h3>
              <p style={aiSubtitle}>
                Get quick, practical advice based on the report above — powered by Groq.
              </p>
            </div>
          </div>

          <button
            style={{
              ...primaryButton,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: aiLoading ? 0.75 : 1,
              flexShrink: 0,
            }}
            onClick={getAiAdvice}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
            ) : (
              <Sparkles size={16} />
            )}
            {aiLoading ? "Analyzing…" : aiAdvice ? "Refresh advice" : "Get AI advice"}
          </button>
        </div>

        {aiError && (
          <div style={aiErrorBox}>
            <AlertCircle size={16} />
            <span>{aiError}</span>
          </div>
        )}

        {aiAdvice && !aiLoading && (
          <div style={aiResultBox}>
            <p style={aiHeadline}>{aiAdvice.headline}</p>
            <ul style={aiList}>
              {aiAdvice.recommendations.map((rec, i) => (
                <li key={i} style={aiListItem}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!aiAdvice && !aiLoading && !aiError && (
          <p style={aiEmptyHint}>
            Click "Get AI advice" to have it read the current numbers and suggest what to do next.
          </p>
        )}
      </div>

      {/* Export */}
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Export</h3>
        <p style={{ color: colors.textMuted, fontSize: 13, marginTop: -8 }}>
          Download the current report for offline use. Coming soon.
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button disabled style={secondaryButton}>
            <FileDown size={16} />
            Export PDF
          </button>

          <button disabled style={secondaryButton}>
            <FileDown size={16} />
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  accent: string;
}) {
  return (
    <div style={{ ...card, ...statCard }}>
      <div style={{ ...statIconWrap, background: `${accent}1a` }}>
        <Icon size={20} color={accent} />
      </div>

      <div>
        <div style={statTitle}>{title}</div>
        <div style={statValue}>{value}</div>
      </div>
    </div>
  );
}

function EmptyChartState({ label }: { label: string }) {
  return (
    <div style={emptyState}>
      <BarChart3 size={28} color={colors.textMuted} />
      <span>{label}</span>
    </div>
  );
}

const filterCard: React.CSSProperties = {
  marginBottom: 24,
};

const filterGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 28,
};

const actionsCol: React.CSSProperties = {
  display: "flex",
  alignItems: "end",
};

const filterFooter: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: 16,
  paddingTop: 16,
  borderTop: `1px solid ${colors.border}`,
};

const rangePill: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: colors.textMuted,
  background: "#f3f4f6",
  padding: "6px 12px",
  borderRadius: 999,
};

const ghostButton: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "transparent",
  border: "none",
  color: colors.textMuted,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  padding: "6px 8px",
};

const kpiGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
  gap: 20,
  marginBottom: 24,
};

const statCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

const statIconWrap: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const statTitle: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: 13,
};

const statValue: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 700,
  marginTop: 4,
  color: colors.dark,
};

const chartsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginBottom: 24,
};

const chartCard: React.CSSProperties = {
  height: 320,
};

const chartTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 16,
};

const emptyState: React.CSSProperties = {
  height: 250,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  color: colors.textMuted,
  fontSize: 13,
  border: `2px dashed ${colors.border}`,
  borderRadius: 12,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
};

const secondaryButton: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 18px",
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  background: "#fff",
  cursor: "not-allowed",
  color: colors.textMuted,
};

const aiCard: React.CSSProperties = {
  marginBottom: 24,
};

const aiHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const aiHeaderLeft: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const aiIconWrap: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#7c3aed1a",
  flexShrink: 0,
};

const aiSubtitle: React.CSSProperties = {
  margin: 0,
  marginTop: 2,
  fontSize: 13,
  color: colors.textMuted,
};

const aiEmptyHint: React.CSSProperties = {
  marginTop: 16,
  marginBottom: 0,
  fontSize: 13,
  color: colors.textMuted,
};

const aiErrorBox: React.CSSProperties = {
  marginTop: 16,
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  color: "#dc2626",
  background: "#dc26261a",
  padding: "10px 14px",
  borderRadius: 10,
};

const aiResultBox: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 18,
  borderTop: `1px solid ${colors.border}`,
};

const aiHeadline: React.CSSProperties = {
  margin: 0,
  marginBottom: 12,
  fontWeight: 600,
  color: colors.dark,
};

const aiList: React.CSSProperties = {
  margin: 0,
  paddingLeft: 20,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const aiListItem: React.CSSProperties = {
  fontSize: 14,
  color: colors.dark,
  lineHeight: 1.5,
};

export default Reports;