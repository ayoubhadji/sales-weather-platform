import { useEffect, useState } from "react";
import api from "../../services/api";

type DashboardStats = {
  products: number;
  sales: number;
  promotions: number;
  alerts: number;
  predictions: number;
  weather: number;
};

type SaleSummary = {
  id: number;
  ticketNumber: string;
  totalAmount: number;
};

type PromotionSummary = {
  id: number;
  product?: { name: string };
  discountPercentage: number;
  reason: string;
};

type AlertSummary = {
  id: number;
  title: string;
  severity: string;
  isRead: boolean;
};

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    sales: 0,
    promotions: 0,
    alerts: 0,
    predictions: 0,
    weather: 0,
  });

  const [recentSales, setRecentSales] = useState<SaleSummary[]>([]);
  const [recentPromotions, setRecentPromotions] = useState<PromotionSummary[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<AlertSummary[]>([]);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [products, sales, promotions, alerts, predictions, weather] = await Promise.all([
        api.get("/products"),
        api.get("/sales-ticket"),
        api.get("/promotions"),
        api.get("/alerts"),
        api.get("/sales-predictions"),
        api.get("/weather"),
      ]);

      setStats({
        products: products.data.length,
        sales: sales.data.length,
        promotions: promotions.data.length,
        alerts: alerts.data.length,
        predictions: predictions.data.length,
        weather: weather.data.length,
      });

      setRecentSales(sales.data.slice(-5).reverse());
      setRecentPromotions(promotions.data.slice(-5).reverse());
      setRecentAlerts(alerts.data.slice(-5).reverse());
    } catch (error) {
      console.error("Error loading admin dashboard:", error);
    }
  }

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrowStyle}>Operations</div>
        <h1 style={titleStyle}>Admin Dashboard</h1>
        <p style={subtitleStyle}>
          Overview of sales, products, promotions, alerts and prediction data.
        </p>
      </div>

      <div style={gridStyle}>
        <StatCard label="Products" value={stats.products} icon="📦" accent="#0F6659" />
        <StatCard label="Sales Tickets" value={stats.sales} icon="🧾" accent="#0F6659" />
        <StatCard label="Promotions" value={stats.promotions} icon="🏷️" accent="#E8A33D" />
        <StatCard label="Alerts" value={stats.alerts} icon="⚠️" accent="#B54708" />
        <StatCard label="Predictions" value={stats.predictions} icon="📈" accent="#0F6659" />
        <StatCard label="Weather Records" value={stats.weather} icon="⛅" accent="#3B6FA0" />
      </div>

      <div style={panelsStyle}>
        <Panel title="Recent Sales" accent="#0F6659">
          {recentSales.length === 0 ? (
            <EmptyState text="No sales tickets found yet." />
          ) : (
            recentSales.map((sale) => (
              <Row key={sale.id} left={sale.ticketNumber} right={`${sale.totalAmount} DT`} />
            ))
          )}
        </Panel>

        <Panel title="Recent Promotions" accent="#E8A33D">
          {recentPromotions.length === 0 ? (
            <EmptyState text="No promotions found yet." />
          ) : (
            recentPromotions.map((promotion) => (
              <Row
                key={promotion.id}
                left={promotion.product?.name ?? "Product"}
                right={`${promotion.discountPercentage}%`}
                caption={promotion.reason}
              />
            ))
          )}
        </Panel>

        <Panel title="Recent Alerts" accent="#B54708">
          {recentAlerts.length === 0 ? (
            <EmptyState text="No alerts found yet." />
          ) : (
            recentAlerts.map((alert) => (
              <Row
                key={alert.id}
                left={alert.title}
                right={alert.severity}
                caption={alert.isRead ? "Read" : "Unread"}
              />
            ))
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: string;
  accent: string;
}) {
  return (
    <div style={statCardStyle}>
      <div style={{ ...iconBadgeStyle, background: `${accent}17`, color: accent }}>{icon}</div>
      <div style={{ color: "#6B7280", fontSize: 13, fontWeight: 600, marginTop: 14 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4, color: "#12181F" }}>{value}</div>
    </div>
  );
}

function Panel({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section style={panelStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ ...dotStyle, background: accent }} />
        <h2 style={panelTitleStyle}>{title}</h2>
      </div>
      <div style={{ display: "grid", gap: 4 }}>{children}</div>
    </section>
  );
}

function Row({ left, right, caption }: { left: string; right: string; caption?: string }) {
  return (
    <div style={rowStyle}>
      <div>
        <div style={{ fontWeight: 600, color: "#12181F" }}>{left}</div>
        {caption && <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{caption}</div>}
      </div>
      <div style={{ fontWeight: 700, whiteSpace: "nowrap", color: "#12181F" }}>{right}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ color: "#94A3B8", padding: "16px 0", textAlign: "center" }}>{text}</div>;
}

const pageStyle: React.CSSProperties = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.1em",
  color: "#0F6659",
  textTransform: "uppercase",
};

const titleStyle: React.CSSProperties = {
  margin: "4px 0 0",
  fontSize: 30,
  fontWeight: 800,
  letterSpacing: "-0.01em",
  color: "#12181F",
};

const subtitleStyle: React.CSSProperties = {
  color: "#6B7280",
  marginTop: 8,
  fontSize: 14,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

const statCardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const iconBadgeStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
};

const panelsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
  marginTop: 24,
};

const panelStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const panelTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#12181F",
};

const dotStyle: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  flexShrink: 0,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "12px 0",
  borderBottom: "1px solid #F1F5F9",
};

export default Dashboard;