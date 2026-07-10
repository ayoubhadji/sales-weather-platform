import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import type { Product } from "../../types/Product";
import type { SalesTicket } from "../../types/SalesTicket";
import type { Weather } from "../../types/Weather";
import type { Promotion } from "../../types/Promotion";
import PageHeader from "../../components/PageHeader";
import { card, colors, primaryButton } from "../../styles/common";
import { LayoutDashboard, CloudSun, Receipt, ShoppingCart } from "lucide-react";

function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<SalesTicket[]>([]);
  const [weather, setWeather] = useState<Weather[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [productsResponse, ticketsResponse, weatherResponse, promotionsResponse] =
        await Promise.all([
          api.get("/products"),
          api.get("/sales-ticket"),
          api.get("/weather"),
          api.get("/promotions"),
        ]);

      setProducts(productsResponse.data);
      setTickets(ticketsResponse.data);
      setWeather(weatherResponse.data);
      setPromotions(promotionsResponse.data);
    } catch (error) {
      console.error("Error loading franchise dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalRevenue = tickets.reduce((sum, ticket) => sum + Number(ticket.totalAmount), 0);
  const latestWeather = weather[0];
  const latestTickets = tickets.slice(0, 5);
  const activePromotions = promotions.slice(0, 3);

  return (
    <div>
      <PageHeader
        icon={LayoutDashboard}
        title="Franchise Dashboard"
        description="Quick overview of menu, sales, weather and promotion activity."
      />

      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading dashboard...</p>
      ) : (
        <>
          <div style={statsGrid}>
            <StatCard label="Products" value={products.length} />
            <StatCard label="Tickets" value={tickets.length} />
            <StatCard label="Revenue" value={`${totalRevenue.toFixed(2)} DT`} />
            <StatCard label="Promotions" value={promotions.length} />
          </div>

          <div style={sectionsGrid}>
            <section style={card}>
              <h2 style={{ marginTop: 0 }}>Latest Weather</h2>
              {latestWeather ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div>Weather date: {latestWeather.weatherDate}</div>
                  <div>Condition: {latestWeather.weatherCondition}</div>
                  <div>Temperature: {latestWeather.temperature} °C</div>
                  <div>Humidity: {latestWeather.humidity}%</div>
                  <div>Wind speed: {latestWeather.windSpeed} km/h</div>
                  <div>Rainfall: {latestWeather.rainfall} mm</div>
                  <Link to="/franchise/weather" style={linkButtonStyle}>
                    View weather history
                  </Link>
                </div>
              ) : (
                <p style={{ color: colors.textMuted }}>No weather records yet.</p>
              )}
            </section>

            <section style={card}>
              <h2 style={{ marginTop: 0 }}>Recent Tickets</h2>
              {latestTickets.length > 0 ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {latestTickets.map((ticket) => (
                    <div key={ticket.id} style={listRowStyle}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{ticket.ticketNumber}</div>
                        <div style={{ color: colors.textMuted, fontSize: 13 }}>{ticket.saleDate}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>{ticket.totalAmount} DT</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.textMuted }}>No tickets found yet.</p>
              )}
              <Link to="/franchise/tickets" style={linkButtonStyle}>
                Open ticket history
              </Link>
            </section>

            <section style={card}>
              <h2 style={{ marginTop: 0 }}>Active Promotions</h2>
              {activePromotions.length > 0 ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {activePromotions.map((promotion) => (
                    <div key={promotion.id} style={listRowStyle}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{promotion.product?.name ?? "Unknown product"}</div>
                        <div style={{ color: colors.textMuted, fontSize: 13 }}>{promotion.reason}</div>
                      </div>
                      <div style={{ fontWeight: 700 }}>{promotion.discountPercentage}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.textMuted }}>No promotions found.</p>
              )}
              <Link to="/franchise/menu" style={linkButtonStyle}>
                Open menu
              </Link>
            </section>
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/franchise/menu" style={actionLinkStyle}>
              <ShoppingCart size={16} />
              Create ticket from menu
            </Link>
            <Link to="/franchise/weather" style={actionLinkStyle}>
              <CloudSun size={16} />
              Check weather
            </Link>
            <Link to="/franchise/tickets/new" style={actionLinkStyle}>
              <Receipt size={16} />
              New ticket
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={statCardStyle}>
      <div style={{ color: colors.textMuted, fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{value}</div>
    </div>
  );
}

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

const statCardStyle: React.CSSProperties = {
  ...card,
  minHeight: 120,
};

const sectionsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
  marginTop: 20,
};

const listRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  padding: "12px 0",
  borderBottom: `1px solid ${colors.border}`,
};

const linkButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  marginTop: 16,
  color: colors.dark,
  fontWeight: 700,
  textDecoration: "none",
};

const actionLinkStyle: React.CSSProperties = {
  ...primaryButton,
  textDecoration: "none",
};

export default Dashboard;