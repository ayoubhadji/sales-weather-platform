import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import type { Product } from "../../types/Product";
import type { SalesTicket } from "../../types/SalesTicket";
import type { Weather } from "../../types/Weather";
import type { Promotion } from "../../types/Promotion";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import { card, colors, primaryButton } from "../../styles/common";
import {
  LayoutDashboard,
  CloudSun,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Package,
  Tag,
  ArrowRight,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Count-up hook — animates a number from 0 to its target value               */
/* -------------------------------------------------------------------------- */
function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuth();
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

  // Last 8 tickets, oldest to newest, for the sparkline
  const trend = tickets.slice(0, 8).reverse().map((t) => Number(t.totalAmount));
  const trendMax = Math.max(...trend, 1);

  const productsCount = useCountUp(loading ? 0 : products.length);
  const ticketsCount = useCountUp(loading ? 0 : tickets.length);
  const revenueCount = useCountUp(loading ? 0 : totalRevenue);
  const promotionsCount = useCountUp(loading ? 0 : promotions.length);

  return (
    <div>
      <style>{keyframes}</style>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 14, color: colors.textMuted, fontWeight: 600 }}>
          {getGreeting()}, {user?.name ?? "there"} 👋
        </div>
      </div>

      <PageHeader
        icon={LayoutDashboard}
        title="Franchise Dashboard"
        description="Quick overview of menu, sales, weather and promotion activity."
      />

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          <div style={statsGrid}>
            <StatCard
              icon={Package}
              label="Products"
              value={Math.round(productsCount)}
              delay={0}
            />
            <StatCard
              icon={Receipt}
              label="Tickets"
              value={Math.round(ticketsCount)}
              delay={80}
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue"
              value={`${revenueCount.toFixed(2)} DT`}
              delay={160}
              accent
            />
            <StatCard
              icon={Tag}
              label="Promotions"
              value={Math.round(promotionsCount)}
              delay={240}
            />
          </div>

          {trend.length > 1 && (
            <div
              style={{
                ...card,
                marginTop: 16,
                animation: "fadeInUp 0.5s ease both",
                animationDelay: "300ms",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: colors.dark }}>Recent sales trend</h3>
                <span style={{ fontSize: 12, color: colors.textMuted }}>last {trend.length} tickets</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60 }}>
                {trend.map((amount, i) => (
                  <div
                    key={i}
                    title={`${amount.toFixed(2)} DT`}
                    style={{
                      flex: 1,
                      height: `${Math.max((amount / trendMax) * 100, 6)}%`,
                      background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                      borderRadius: "4px 4px 0 0",
                      animation: "growUp 0.6s ease both",
                      animationDelay: `${400 + i * 60}ms`,
                      transformOrigin: "bottom",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={sectionsGrid}>
            <section style={{ ...card, animation: "fadeInUp 0.5s ease both", animationDelay: "360ms" }}>
              <h2 style={{ marginTop: 0, fontSize: 16 }}>Latest Weather</h2>
              {latestWeather ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "float 3s ease-in-out infinite",
                      }}
                    >
                      <CloudSun size={22} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 20 }}>{latestWeather.temperature}°C</div>
                      <div style={{ color: colors.textMuted, fontSize: 13 }}>{latestWeather.weatherCondition}</div>
                    </div>
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: 13 }}>Date: {latestWeather.weatherDate}</div>
                  <div style={{ color: colors.textMuted, fontSize: 13 }}>Humidity: {latestWeather.humidity}%</div>
                  <div style={{ color: colors.textMuted, fontSize: 13 }}>Wind: {latestWeather.windSpeed} km/h</div>
                  <div style={{ color: colors.textMuted, fontSize: 13 }}>Rainfall: {latestWeather.rainfall} mm</div>
                  <HoverLink to="/franchise/weather">View weather history</HoverLink>
                </div>
              ) : (
                <p style={{ color: colors.textMuted }}>No weather records yet.</p>
              )}
            </section>

            <section style={{ ...card, animation: "fadeInUp 0.5s ease both", animationDelay: "420ms" }}>
              <h2 style={{ marginTop: 0, fontSize: 16 }}>Recent Tickets</h2>
              {latestTickets.length > 0 ? (
                <div style={{ display: "grid", gap: 4 }}>
                  {latestTickets.map((ticket) => (
                    <div key={ticket.id} style={listRowStyle} className="dash-row">
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
              <HoverLink to="/franchise/tickets">Open ticket history</HoverLink>
            </section>

            <section style={{ ...card, animation: "fadeInUp 0.5s ease both", animationDelay: "480ms" }}>
              <h2 style={{ marginTop: 0, fontSize: 16 }}>Active Promotions</h2>
              {activePromotions.length > 0 ? (
                <div style={{ display: "grid", gap: 4 }}>
                  {activePromotions.map((promotion) => (
                    <div key={promotion.id} style={listRowStyle} className="dash-row">
                      <div>
                        <div style={{ fontWeight: 700 }}>{promotion.product?.name ?? "Unknown product"}</div>
                        <div style={{ color: colors.textMuted, fontSize: 13 }}>{promotion.reason}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: colors.accentDark }}>
                        {promotion.discountPercentage}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.textMuted }}>No promotions found.</p>
              )}
              <HoverLink to="/franchise/menu">Open menu</HoverLink>
            </section>
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              animation: "fadeInUp 0.5s ease both",
              animationDelay: "540ms",
            }}
          >
            <ActionLink to="/franchise/menu" icon={ShoppingCart}>
              Create ticket from menu
            </ActionLink>
            <ActionLink to="/franchise/weather" icon={CloudSun}>
              Check weather
            </ActionLink>
            <ActionLink to="/franchise/tickets/new" icon={Receipt}>
              New ticket
            </ActionLink>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string | number;
  delay: number;
  accent?: boolean;
}

function StatCard({ icon: Icon, label, value, delay, accent }: StatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...card,
        minHeight: 120,
        animation: "fadeInUp 0.5s ease both",
        animationDelay: `${delay}ms`,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 16px 32px rgba(15,23,42,0.12)"
          : "0 8px 24px rgba(15,23,42,0.06)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: colors.textMuted, fontSize: 14 }}>{label}</span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: accent ? colors.accent : "#f1f5f9",
          }}
        >
          <Icon size={16} color={accent ? "#fff" : colors.dark} />
        </div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8, color: colors.dark }}>{value}</div>
    </div>
  );
}

function HoverLink({ to, children }: { to: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginTop: 16,
        color: colors.dark,
        fontWeight: 700,
        fontSize: 13,
        textDecoration: "none",
      }}
    >
      {children}
      <ArrowRight
        size={14}
        style={{
          transform: hovered ? "translateX(3px)" : "translateX(0)",
          transition: "transform 0.15s ease",
        }}
      />
    </Link>
  );
}

function ActionLink({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...primaryButton,
        textDecoration: "none",
        transform: hovered ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered ? "0 10px 20px rgba(15,23,42,0.2)" : "none",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <Icon size={16} />
      {children}
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div style={statsGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            ...card,
            minHeight: 120,
            animation: "pulse 1.4s ease-in-out infinite",
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div style={{ height: 12, width: "50%", background: "#e2e8f0", borderRadius: 4, marginBottom: 16 }} />
          <div style={{ height: 28, width: "70%", background: "#e2e8f0", borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
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
  padding: "10px 8px",
  borderRadius: 8,
  transition: "background-color 0.15s ease",
};

const keyframes = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes growUp {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.dash-row:hover {
  background-color: #f8fafc;
}
`;

export default Dashboard;