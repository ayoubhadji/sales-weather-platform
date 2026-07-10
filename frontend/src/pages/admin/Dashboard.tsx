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
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: "#64748b", marginTop: 8 }}>
          Overview of sales, products, promotions, alerts and prediction data.
        </p>
      </div>

      <div style={gridStyle}>
        <StatCard label="Products" value={stats.products} />
        <StatCard label="Sales Tickets" value={stats.sales} />
        <StatCard label="Promotions" value={stats.promotions} />
        <StatCard label="Alerts" value={stats.alerts} />
        <StatCard label="Predictions" value={stats.predictions} />
        <StatCard label="Weather Records" value={stats.weather} />
      </div>

      <div style={panelsStyle}>
        <Panel title="Recent Sales">
          {recentSales.length === 0 ? (
            <EmptyState text="No sales tickets found yet." />
          ) : (
            recentSales.map((sale) => (
              <Row key={sale.id} left={sale.ticketNumber} right={`${sale.totalAmount} DT`} />
            ))
          )}
        </Panel>

        <Panel title="Recent Promotions">
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

        <Panel title="Recent Alerts">
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={statCardStyle}>
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={panelStyle}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </section>
  );
}

function Row({ left, right, caption }: { left: string; right: string; caption?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 0",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>{left}</div>
        {caption && <div style={{ fontSize: 13, color: "#64748b" }}>{caption}</div>}
      </div>
      <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{right}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ color: "#64748b", padding: "8px 0" }}>{text}</div>;
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

const statCardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const panelsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
  marginTop: 24,
};

const panelStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

export default Dashboard;