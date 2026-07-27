import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import type { Product } from "../../types/Product";
import type { SalesTicket } from "../../types/SalesTicket";
import type { Weather } from "../../types/Weather";
import type { Promotion } from "../../types/Promotion";
import { useAuth } from "../../context/AuthContext";
import { card, colors, primaryButton } from "../../styles/common";
import {
  CloudSun,
  Receipt,
  ShoppingCart,
  Package,
  Tag,
  ArrowRight,
  Droplets,
  Wind,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Signature palette — scoped to this page only. Everything else in the app  */
/* keeps using styles/common so the rest of the UI stays consistent; this    */
/* file just introduces a bolder accent set for the dashboard's hero moment. */
/* -------------------------------------------------------------------------- */
const INK = "#12172B";
const INK_SOFT = "#1C2340";
const COPPER = "#C4622D";
const SKY = "#5B9BC7";
const SIGNAL = "#5FA777";

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

function getTodayLabel() {
  return new Date()
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
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

  const trend = tickets.slice(0, 8).reverse().map((t) => Number(t.totalAmount));
  const trendMax = Math.max(...trend, 1);

  const productsCount = useCountUp(loading ? 0 : products.length);
  const ticketsCount = useCountUp(loading ? 0 : tickets.length);
  const revenueCount = useCountUp(loading ? 0 : totalRevenue);
  const promotionsCount = useCountUp(loading ? 0 : promotions.length);

  return (
    <div>
      <style>{globalStyles}</style>

      {loading ? (
        <SkeletonHero />
      ) : (
        <ConditionsHero
          userName={user?.name}
          weather={latestWeather}
          revenue={revenueCount}
          ticketCount={tickets.length}
          trend={trend}
          trendMax={trendMax}
        />
      )}

      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          <div style={statsGrid}>
            <StatTicker icon={Package} label="Products" value={Math.round(productsCount)} accent={COPPER} delay={0} />
            <StatTicker icon={Receipt} label="Tickets" value={Math.round(ticketsCount)} accent={SKY} delay={80} />
            <StatTicker icon={Tag} label="Promotions" value={Math.round(promotionsCount)} accent={SIGNAL} delay={160} />
            <StatTicker
              icon={ShoppingCart}
              label="Avg. ticket"
              value={`${tickets.length ? (totalRevenue / tickets.length).toFixed(2) : "0.00"} DT`}
              accent={INK_SOFT}
              delay={240}
            />
          </div>

          <div style={sectionsGrid}>
            <section style={{ ...card, ...sectionCard, animationDelay: "320ms" }}>
              <SectionHeader icon={CloudSun} label="Latest Weather" color={SKY} />
              {latestWeather ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={metaGrid}>
                    <MetaItem label="Date" value={latestWeather.weatherDate} />
                    <MetaItem label="Humidity" value={`${latestWeather.humidity}%`} />
                    <MetaItem label="Wind" value={`${latestWeather.windSpeed} km/h`} />
                    <MetaItem label="Rainfall" value={`${latestWeather.rainfall} mm`} />
                  </div>
                  <HoverLink to="/franchise/weather" color={SKY}>View weather history</HoverLink>
                </div>
              ) : (
                <p style={{ color: colors.textMuted }}>No weather records yet.</p>
              )}
            </section>

            <section style={{ ...card, ...sectionCard, animationDelay: "380ms" }}>
              <SectionHeader icon={Receipt} label="Recent Tickets" color={COPPER} />
              {latestTickets.length > 0 ? (
                <div style={{ display: "grid", gap: 4 }}>
                  {latestTickets.map((ticket) => (
                    <div key={ticket.id} style={listRowStyle} className="dash-row">
                      <div>
                        <div style={{ fontWeight: 700 }}>{ticket.ticketNumber}</div>
                        <div style={{ color: colors.textMuted, fontSize: 13 }}>{ticket.saleDate}</div>
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
                        {ticket.totalAmount} DT
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.textMuted }}>No tickets found yet.</p>
              )}
              <HoverLink to="/franchise/tickets" color={COPPER}>Open ticket history</HoverLink>
            </section>

            <section style={{ ...card, ...sectionCard, animationDelay: "440ms" }}>
              <SectionHeader icon={Tag} label="Active Promotions" color={SIGNAL} />
              {activePromotions.length > 0 ? (
                <div style={{ display: "grid", gap: 4 }}>
                  {activePromotions.map((promotion) => (
                    <div key={promotion.id} style={listRowStyle} className="dash-row">
                      <div>
                        <div style={{ fontWeight: 700 }}>{promotion.product?.name ?? "Unknown product"}</div>
                        <div style={{ color: colors.textMuted, fontSize: 13 }}>{promotion.reason}</div>
                      </div>
                      <div style={{ ...promoBadge, color: SIGNAL, background: `${SIGNAL}1a` }}>
                        {promotion.discountPercentage}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: colors.textMuted }}>No promotions found.</p>
              )}
              <HoverLink to="/franchise/menu" color={SIGNAL}>Open menu</HoverLink>
            </section>
          </div>

          <div style={actionsRow}>
            <ActionLink to="/franchise/tickets/new" icon={Receipt} primary>
              New ticket
            </ActionLink>
            <ActionLink to="/franchise/menu" icon={ShoppingCart}>
              Create ticket from menu
            </ActionLink>
            <ActionLink to="/franchise/weather" icon={CloudSun}>
              Check weather
            </ActionLink>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero — the signature element: weather + revenue read as one instrument     */
/* -------------------------------------------------------------------------- */

function ConditionsHero({
  userName,
  weather,
  revenue,
  ticketCount,
  trend,
  trendMax,
}: {
  userName?: string;
  weather?: Weather;
  revenue: number;
  ticketCount: number;
  trend: number[];
  trendMax: number;
}) {
  const humidity = weather?.humidity ?? 0;
  const ringCircumference = 2 * Math.PI * 30;
  const ringOffset = ringCircumference - (humidity / 100) * ringCircumference;

  return (
    <section style={heroPanel}>
      <div style={heroGlow} />

      <div style={heroTopRow}>
        <div>
          <div style={heroGreeting}>
            {getGreeting()}, {userName ?? "there"}
          </div>
          <div style={heroEyebrow}>TODAY'S CONDITIONS</div>
        </div>
        <div style={heroDate}>{getTodayLabel()}</div>
      </div>

      <div style={heroSplit}>
        {/* Weather dial */}
        <div style={heroCol}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}>
              <svg width="76" height="76" viewBox="0 0 76 76">
                <circle cx="38" cy="38" r="30" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
                <circle
                  cx="38"
                  cy="38"
                  r="30"
                  fill="none"
                  stroke={SKY}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 38 38)"
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div style={heroIconWrap}>
                <CloudSun size={26} color="#fff" />
              </div>
            </div>
            <div>
              <div style={heroTemp}>{weather ? `${weather.temperature}°` : "—"}</div>
              <div style={heroSub}>{weather?.weatherCondition ?? "No data"}</div>
            </div>
          </div>

          {weather && (
            <div style={heroTicksRow}>
              <HeroTick icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
              <div style={heroTickDivider} />
              <HeroTick icon={Wind} label="Wind" value={`${weather.windSpeed} km/h`} />
            </div>
          )}
        </div>

        <div style={heroVerticalDivider} />

        {/* Revenue ticker */}
        <div style={heroCol}>
          <div style={heroEyebrowSmall}>REVENUE TODAY</div>
          <div style={heroRevenue}>
            {revenue.toFixed(2)} <span style={heroRevenueUnit}>DT</span>
          </div>
          <div style={heroSub}>across {ticketCount} ticket{ticketCount === 1 ? "" : "s"}</div>

          {trend.length > 1 && (
            <div style={heroSparkline}>
              {trend.map((amount, i) => (
                <div
                  key={i}
                  title={`${amount.toFixed(2)} DT`}
                  style={{
                    flex: 1,
                    height: `${Math.max((amount / trendMax) * 100, 8)}%`,
                    background: COPPER,
                    opacity: 0.55 + (i / trend.length) * 0.45,
                    borderRadius: "2px 2px 0 0",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function HeroTick({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Icon size={14} color="rgba(255,255,255,0.55)" />
      <div>
        <div style={heroTickLabel}>{label}</div>
        <div style={heroTickValue}>{value}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function StatTicker({
  icon: Icon,
  label,
  value,
  accent,
  delay,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string | number;
  accent: string;
  delay: number;
}) {
  return (
    <div style={{ ...card, ...statTickerCard, animationDelay: `${delay}ms` }}>
      <div style={{ ...statTickerBar, background: accent }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon size={14} color={accent} />
        <span style={statTickerLabel}>{label}</span>
      </div>
      <div style={statTickerValue}>{value}</div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  color: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ ...sectionIconWrap, backgroundColor: `${color}1a` }}>
        <Icon size={15} color={color} />
      </div>
      <h2 style={{ margin: 0, fontSize: 16, color: colors.dark }}>{label}</h2>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: colors.textMuted }}>{label}</span>
      <span style={{ fontWeight: 600, color: colors.dark, fontFamily: "'IBM Plex Mono', monospace" }}>
        {value}
      </span>
    </div>
  );
}

function HoverLink({ to, children, color }: { to: string; children: React.ReactNode; color: string }) {
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
        color,
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
  primary,
}: {
  to: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...(primary
          ? { ...primaryButton, background: INK, border: `1px solid ${INK}` }
          : actionGhostButton),
        textDecoration: "none",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? primary
            ? "0 12px 24px rgba(18,23,43,0.25)"
            : "0 8px 16px rgba(15,23,42,0.08)"
          : "none",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <Icon size={16} />
      {children}
    </Link>
  );
}

function SkeletonHero() {
  return <div style={{ ...heroPanel, minHeight: 200 }} />;
}

function SkeletonGrid() {
  return (
    <div style={statsGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            ...card,
            minHeight: 96,
            animation: "pulse 1.4s ease-in-out infinite",
            animationDelay: `${i * 100}ms`,
          }}
        >
          <div style={{ height: 10, width: "40%", background: "#e2e8f0", borderRadius: 4, marginBottom: 16 }} />
          <div style={{ height: 24, width: "60%", background: "#e2e8f0", borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const heroPanel: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 24,
  background: `linear-gradient(155deg, ${INK} 0%, ${INK_SOFT} 100%)`,
  padding: "28px 32px 32px",
  marginBottom: 20,
  animation: "fadeInUp 0.5s ease both",
};

const heroGlow: React.CSSProperties = {
  position: "absolute",
  top: -80,
  right: -80,
  width: 260,
  height: 260,
  borderRadius: "50%",
  background: `radial-gradient(circle, ${SKY}33 0%, transparent 70%)`,
  pointerEvents: "none",
};

const heroTopRow: React.CSSProperties = {
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 24,
};

const heroGreeting: React.CSSProperties = {
  fontFamily: "'Fraunces', serif",
  fontSize: 20,
  fontWeight: 500,
  color: "#fff",
};

const heroEyebrow: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.12em",
  color: COPPER,
  marginTop: 4,
};

const heroEyebrowSmall: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.5)",
  marginBottom: 6,
};

const heroDate: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.08em",
  color: "rgba(255,255,255,0.45)",
  paddingTop: 4,
};

const heroSplit: React.CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  gap: 28,
  alignItems: "center",
};

const heroCol: React.CSSProperties = {
  minWidth: 0,
};

const heroVerticalDivider: React.CSSProperties = {
  width: 1,
  alignSelf: "stretch",
  background: "rgba(255,255,255,0.12)",
};

const heroIconWrap: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const heroTemp: React.CSSProperties = {
  fontFamily: "'Fraunces', serif",
  fontSize: 36,
  fontWeight: 600,
  color: "#fff",
  lineHeight: 1,
};

const heroSub: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.55)",
  marginTop: 4,
  textTransform: "capitalize",
};

const heroTicksRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginTop: 18,
};

const heroTickDivider: React.CSSProperties = {
  width: 1,
  height: 22,
  background: "rgba(255,255,255,0.12)",
};

const heroTickLabel: React.CSSProperties = {
  fontSize: 10,
  color: "rgba(255,255,255,0.45)",
  letterSpacing: "0.04em",
};

const heroTickValue: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 13,
  color: "#fff",
  fontWeight: 500,
};

const heroRevenue: React.CSSProperties = {
  fontFamily: "'Fraunces', serif",
  fontSize: 42,
  fontWeight: 600,
  color: "#fff",
  lineHeight: 1,
};

const heroRevenueUnit: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 400,
  color: "rgba(255,255,255,0.5)",
};

const heroSparkline: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  gap: 4,
  height: 32,
  marginTop: 16,
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 14,
};

const statTickerCard: React.CSSProperties = {
  position: "relative",
  paddingTop: 20,
  paddingLeft: 18,
  overflow: "hidden",
  animation: "fadeInUp 0.5s ease both",
};

const statTickerBar: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 3,
};

const statTickerLabel: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.03em",
  color: colors.textMuted,
  textTransform: "uppercase",
};

const statTickerValue: React.CSSProperties = {
  fontFamily: "'Fraunces', serif",
  fontSize: 26,
  fontWeight: 600,
  color: colors.dark,
};

const sectionsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
  marginTop: 20,
};

const sectionCard: React.CSSProperties = {
  animation: "fadeInUp 0.5s ease both",
};

const sectionIconWrap: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const metaGrid: React.CSSProperties = {
  display: "grid",
  gap: 8,
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

const promoBadge: React.CSSProperties = {
  fontWeight: 700,
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 13,
};

const actionsRow: React.CSSProperties = {
  marginTop: 20,
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  animation: "fadeInUp 0.5s ease both",
  animationDelay: "540ms",
};

const actionGhostButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 20px",
  borderRadius: 10,
  border: `1px solid ${colors.border}`,
  background: "#fff",
  color: colors.dark,
  fontWeight: 600,
  fontSize: 14,
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
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