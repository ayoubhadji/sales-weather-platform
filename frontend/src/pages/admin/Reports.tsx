import { useEffect, useState } from "react";
import { BarChart3, FileDown } from "lucide-react";
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

  const [revenueTrend, setRevenueTrend] = useState<{ date: string; revenue: number }[]>([]);

  const [categorySales, setCategorySales] = useState<{ category: string; sales: number }[]>([]);

  useEffect(() => {
  loadSummary();
  loadRevenueTrend();
  loadCategorySales();
  loadFranchises();
}, []);;

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

  return (
    <div>
      <PageHeader
        icon={BarChart3}
        title="Analytics & Reports"
        description="Generate business reports and export sales insights."
      />

      {/* Filters */}
      <div
        style={{
          ...card,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
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
              <option
                key={franchise.id}
                value={franchise.id}
              >
                {franchise.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Report</label>
          <select style={inputStyle}>
            <option>Sales Report</option>
            <option>Products Report</option>
            <option>Franchise Report</option>
            <option>Weather Report</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "end",
          }}
        >
          <button
            style={{ ...primaryButton, width: "100%" }}
            onClick={() => {
              loadSummary();
              loadRevenueTrend();
              loadCategorySales();
            }}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <StatCard
          title="Revenue"
          value={`${summary.revenue.toFixed(2)} DT`}
        />

        <StatCard
          title="Tickets"
          value={summary.tickets.toString()}
        />

        <StatCard
          title="Average Ticket"
          value={`${summary.averageTicket.toFixed(2)} DT`}
        />

        <StatCard
          title="Top Product"
          value={summary.topProduct}
        />
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ ...card, height: 320 }}>
          <h3 style={{ marginTop: 0 }}>Revenue Trend</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })
                }
              />

              <YAxis />

              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)} DT`, "Revenue"]}
                labelFormatter={(label) =>
                  new Date(String(label)).toLocaleDateString("en-GB")
                }
              />

              <Line
                //type="monotone"
                type="natural"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ ...card, height: 320 }}>
                <h3 style={{ marginTop: 0 }}>Sales by Category</h3>

                <div style={{ ...card, height: 320 }}>
        <h3 style={{ marginTop: 0 }}>Sales by Category</h3>

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
                <Cell
                  key={index}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
        </div>
      </div>

      {/* Export */}
      <div style={card}>
        <h3 style={{ marginTop: 0 }}>Export</h3>

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
}: {
  title: string;
  value: string;
}) {
  return (
    <div style={card}>
      <div
        style={{
          color: colors.textMuted,
          fontSize: 13,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginTop: 10,
          color: colors.dark,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// function Placeholder() {
//   return (
//     <div
//       style={{
//         height: "100%",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         color: colors.textMuted,
//         border: `2px dashed ${colors.border}`,
//         borderRadius: 12,
//       }}
//     >
//       Chart coming soon
//     </div>
//   );
// }

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

export default Reports;