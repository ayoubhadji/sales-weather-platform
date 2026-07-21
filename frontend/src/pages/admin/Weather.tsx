import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import type { Weather } from "../../types/Weather";
import PageHeader from "../../components/PageHeader";
import { card, colors } from "../../styles/common";
import {
  CloudSun,
  RotateCcw,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Weather -> visual theme mapping                                            */
/* -------------------------------------------------------------------------- */
type ThemeKey = "sunny" | "cloudy" | "rainy" | "stormy" | "foggy";

interface WeatherTheme {
  key: ThemeKey;
  gradient: string;
  pageWash: string;
  textColor: string;
  subTextColor: string;
  icon: typeof Sun;
}

function getWeatherTheme(condition?: string): WeatherTheme {
  const c = (condition ?? "").toLowerCase();

  if (c.includes("storm") || c.includes("thunder")) {
    return {
      key: "stormy",
      gradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #020617 100%)",
      pageWash: "linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(255,255,255,0) 300px)",
      textColor: "#fff",
      subTextColor: "rgba(255,255,255,0.7)",
      icon: CloudLightning,
    };
  }
  if (c.includes("rain") || c.includes("shower") || c.includes("drizzle")) {
    return {
      key: "rainy",
      gradient: "linear-gradient(135deg, #475569 0%, #1e293b 100%)",
      pageWash: "linear-gradient(180deg, rgba(71,85,105,0.06) 0%, rgba(255,255,255,0) 300px)",
      textColor: "#fff",
      subTextColor: "rgba(255,255,255,0.7)",
      icon: CloudRain,
    };
  }
  if (c.includes("fog") || c.includes("mist") || c.includes("haze")) {
    return {
      key: "foggy",
      gradient: "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)",
      pageWash: "linear-gradient(180deg, rgba(148,163,184,0.08) 0%, rgba(255,255,255,0) 300px)",
      textColor: "#0f172a",
      subTextColor: "rgba(15,23,42,0.65)",
      icon: CloudFog,
    };
  }
  if (c.includes("cloud") || c.includes("overcast")) {
    return {
      key: "cloudy",
      gradient: "linear-gradient(135deg, #93a5b8 0%, #64748b 100%)",
      pageWash: "linear-gradient(180deg, rgba(100,116,139,0.06) 0%, rgba(255,255,255,0) 300px)",
      textColor: "#fff",
      subTextColor: "rgba(255,255,255,0.7)",
      icon: Cloud,
    };
  }
  // default: sunny / clear
  return {
    key: "sunny",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #38bdf8 100%)",
    pageWash: "linear-gradient(180deg, rgba(56,189,248,0.06) 0%, rgba(255,255,255,0) 300px)",
    textColor: "#fff",
    subTextColor: "rgba(255,255,255,0.85)",
    icon: Sun,
  };
}

/* -------------------------------------------------------------------------- */
/* Actual vs predicted                                                        */
/* -------------------------------------------------------------------------- */

// Heuristic fallback: a date after today can't be a real recorded reading,
// so treat it as a prediction. If your Weather entity/API already exposes an
// explicit flag (e.g. `isPredicted` or `source`), swap this for that field —
// it'll be more reliable than a date guess, especially for backfilled data.
function isPredicted(entry: Weather): boolean {
  const anyEntry = entry as any;
  if (typeof anyEntry.isPredicted === "boolean") return anyEntry.isPredicted;
  if (typeof anyEntry.source === "string") return anyEntry.source.toLowerCase() !== "actual";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entryDate = new Date(entry.weatherDate);
  entryDate.setHours(0, 0, 0, 0);
  return entryDate.getTime() > today.getTime();
}

function SourceBadge({ predicted }: { predicted: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: predicted ? "#7c3aed1a" : "#16a34a1a",
        color: predicted ? "#7c3aed" : "#16a34a",
        border: predicted ? "1px dashed #7c3aed66" : "1px solid transparent",
      }}
    >
      {predicted ? <Sparkles size={12} /> : <CheckCircle2 size={12} />}
      {predicted ? "Predicted" : "Actual"}
    </span>
  );
}

function WeatherPage() {
  const [weather, setWeather] = useState<Weather[]>([]);
  const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<"all" | "actual" | "predicted">("all");

  useEffect(() => {
    void loadWeather();
  }, []);

  async function loadWeather() {
    try {
      const [historyResponse, currentResponse] = await Promise.all([
        api.get("/weather"),
        api.get("/weather/current"),
      ]);

      setWeather(historyResponse.data);
      setCurrentWeather(currentResponse.data);
    } catch (error) {
      console.error("Error loading franchise weather:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshCurrentWeather() {
    setRefreshing(true);
    try {
      const response = await api.post("/weather/import");
      setCurrentWeather(response.data);
      await loadWeather();
    } catch (error) {
      console.error("Error importing current weather:", error);
    } finally {
      setRefreshing(false);
    }
  }

  const theme = getWeatherTheme(currentWeather?.weatherCondition);

  const sortedWeather = useMemo(
    () =>
      [...weather].sort(
        (a, b) => new Date(b.weatherDate).getTime() - new Date(a.weatherDate).getTime(),
      ),
    [weather],
  );

  const actualCount = useMemo(() => weather.filter((w) => !isPredicted(w)).length, [weather]);
  const predictedCount = useMemo(() => weather.filter((w) => isPredicted(w)).length, [weather]);

  const filteredWeather = useMemo(() => {
    if (sourceFilter === "all") return sortedWeather;
    return sortedWeather.filter((w) =>
      sourceFilter === "predicted" ? isPredicted(w) : !isPredicted(w),
    );
  }, [sortedWeather, sourceFilter]);

  return (
    <div>
      <style>{globalKeyframes}</style>

      <PageHeader
        icon={CloudSun}
        title="Weather"
        description="Current weather plus historical records used for sales decisions."
      />

      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading weather data...</p>
      ) : (
        <>
          <WeatherHero
            theme={theme}
            currentWeather={currentWeather}
            refreshing={refreshing}
            onRefresh={refreshCurrentWeather}
          />

          <section style={{ ...card, marginTop: 20 }}>
            <div style={historyHeader}>
              <h2 style={{ margin: 0 }}>Weather History</h2>

              <div style={filterChips}>
                <FilterChip
                  label="All"
                  count={weather.length}
                  color={colors.dark}
                  active={sourceFilter === "all"}
                  onClick={() => setSourceFilter("all")}
                />
                <FilterChip
                  label="Actual"
                  count={actualCount}
                  color="#16a34a"
                  active={sourceFilter === "actual"}
                  onClick={() => setSourceFilter(sourceFilter === "actual" ? "all" : "actual")}
                />
                <FilterChip
                  label="Predicted"
                  count={predictedCount}
                  color="#7c3aed"
                  active={sourceFilter === "predicted"}
                  onClick={() =>
                    setSourceFilter(sourceFilter === "predicted" ? "all" : "predicted")
                  }
                />
              </div>
            </div>

            {filteredWeather.length === 0 ? (
              <p style={{ color: colors.textMuted, marginTop: 12 }}>
                No {sourceFilter !== "all" ? sourceFilter : ""} weather records found.
              </p>
            ) : (
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Temperature</th>
                      <th style={thStyle}>Humidity</th>
                      <th style={thStyle}>Rainfall</th>
                      <th style={thStyle}>Wind speed</th>
                      <th style={thStyle}>Condition</th>
                      <th style={thStyle}>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWeather.map((entry, i) => {
                      const rowTheme = getWeatherTheme(entry.weatherCondition);
                      const predicted = isPredicted(entry);
                      return (
                        <tr
                          key={entry.id}
                          style={{
                            backgroundColor: predicted
                              ? "#7c3aed08"
                              : i % 2 === 1
                              ? "#f8fafc"
                              : "#fff",
                            borderLeft: predicted
                              ? "3px dashed #7c3aed66"
                              : "3px solid transparent",
                          }}
                        >
                          <td style={tdStyle}>{entry.weatherDate}</td>
                          <td
                            style={{
                              ...tdStyle,
                              fontWeight: 700,
                              fontStyle: predicted ? "italic" : "normal",
                              opacity: predicted ? 0.85 : 1,
                            }}
                          >
                            {entry.temperature} °C
                          </td>
                          <td style={{ ...tdStyle, opacity: predicted ? 0.85 : 1 }}>
                            {entry.humidity}%
                          </td>
                          <td style={{ ...tdStyle, opacity: predicted ? 0.85 : 1 }}>
                            {entry.rainfall} mm
                          </td>
                          <td style={{ ...tdStyle, opacity: predicted ? 0.85 : 1 }}>
                            {entry.windSpeed} km/h
                          </td>
                          <td style={tdStyle}>
                            <ConditionBadge condition={entry.weatherCondition} theme={rowTheme} />
                          </td>
                          <td style={tdStyle}>
                            <SourceBadge predicted={predicted} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        background: "#fff",
        border: active ? `2px solid ${color}` : `1px solid ${colors.border}`,
        color: active ? color : colors.dark,
        cursor: "pointer",
      }}
    >
      {label}
      <span style={{ fontWeight: 700, color }}>{count}</span>
    </button>
  );
}

function ConditionBadge({ condition, theme }: { condition: string; theme: WeatherTheme }) {
  const badgeColors: Record<ThemeKey, { bg: string; fg: string }> = {
    sunny: { bg: "#fef3c7", fg: "#b45309" },
    cloudy: { bg: "#e2e8f0", fg: "#475569" },
    rainy: { bg: "#dbeafe", fg: "#1d4ed8" },
    stormy: { bg: "#e0e7ff", fg: "#4338ca" },
    foggy: { bg: "#f1f5f9", fg: "#64748b" },
  };
  const { bg, fg } = badgeColors[theme.key];
  const Icon = theme.icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: bg,
        color: fg,
        textTransform: "capitalize",
      }}
    >
      <Icon size={12} />
      {condition.toLowerCase()}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Animated hero banner                                                       */
/* -------------------------------------------------------------------------- */

function WeatherHero({
  theme,
  currentWeather,
  refreshing,
  onRefresh,
}: {
  theme: WeatherTheme;
  currentWeather: Weather | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const Icon = theme.icon;

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        background: theme.gradient,
        padding: "28px 28px 24px",
        minHeight: 220,
        transition: "background 0.6s ease",
      }}
    >
      {/* Decorative animated layer, behind content */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {theme.key === "sunny" && <SunRays />}
        {theme.key === "cloudy" && <DriftingClouds count={4} />}
        {theme.key === "rainy" && (
          <>
            <DriftingClouds count={2} muted />
            <FallingRain count={45} />
          </>
        )}
        {theme.key === "stormy" && (
          <>
            <DriftingClouds count={2} muted />
            <FallingRain count={55} fast />
            <LightningFlash />
          </>
        )}
        {theme.key === "foggy" && <FogLayers />}
      </div>

      {/* Content, above the animated layer */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: theme.key === "sunny" ? "float 3s ease-in-out infinite" : undefined,
              }}
            >
              <Icon size={28} color={theme.textColor} />
            </div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 800, color: theme.textColor, lineHeight: 1 }}>
                {currentWeather ? `${currentWeather.temperature}°C` : "--"}
              </div>
              <div style={{ fontSize: 14, color: theme.subTextColor, marginTop: 4 }}>
                {currentWeather?.weatherCondition ?? "No data"}
              </div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={refreshing}
            style={{
              ...glassButtonStyle,
              color: theme.textColor,
              borderColor:
                theme.key === "foggy" ? "rgba(15,23,42,0.25)" : "rgba(255,255,255,0.35)",
            }}
          >
            <RotateCcw size={16} className={refreshing ? "spin" : undefined} />
            {refreshing ? "Refreshing..." : "Import current weather"}
          </button>
        </div>

        {currentWeather ? (
          <div style={metricsGrid}>
            <GlassMetric label="Date" value={currentWeather.weatherDate} theme={theme} />
            <GlassMetric label="Humidity" value={`${currentWeather.humidity}%`} theme={theme} />
            <GlassMetric label="Rainfall" value={`${currentWeather.rainfall} mm`} theme={theme} />
            <GlassMetric label="Wind speed" value={`${currentWeather.windSpeed} km/h`} theme={theme} />
          </div>
        ) : (
          <p style={{ color: theme.subTextColor }}>No current weather available.</p>
        )}
      </div>
    </section>
  );
}

function GlassMetric({ label, value, theme }: { label: string; value: string; theme: WeatherTheme }) {
  return (
    <div
      style={{
        backgroundColor: theme.key === "foggy" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.14)",
        backdropFilter: "blur(6px)",
        border: `1px solid ${theme.key === "foggy" ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.22)"}`,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ color: theme.subTextColor, fontSize: 12 }}>{label}</div>
      <div style={{ marginTop: 6, fontWeight: 700, color: theme.textColor }}>{value}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Decorative animations                                                      */
/* -------------------------------------------------------------------------- */

function SunRays() {
  return (
    <div
      style={{
        position: "absolute",
        top: "-60px",
        right: "-60px",
        width: 260,
        height: 260,
        borderRadius: "50%",
        background:
          "conic-gradient(from 0deg, rgba(255,255,255,0.35), transparent 20%, rgba(255,255,255,0.25) 40%, transparent 60%, rgba(255,255,255,0.3) 80%, transparent 100%)",
        animation: "spin 18s linear infinite",
        opacity: 0.7,
      }}
    />
  );
}

function DriftingClouds({ count, muted }: { count: number; muted?: boolean }) {
  const clouds = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        top: 10 + Math.random() * 60,
        scale: 0.7 + Math.random() * 0.8,
        duration: 30 + Math.random() * 30,
        delay: -Math.random() * 30,
        opacity: muted ? 0.2 + Math.random() * 0.15 : 0.3 + Math.random() * 0.25,
      })),
    [count, muted]
  );

  return (
    <>
      {clouds.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${c.top}%`,
            left: "-15%",
            opacity: c.opacity,
            transform: `scale(${c.scale})`,
            animation: `cloudDrift ${c.duration}s linear ${c.delay}s infinite`,
          }}
        >
          <Cloud size={90} color="#fff" fill="#fff" />
        </div>
      ))}
    </>
  );
}

function FallingRain({ count, fast }: { count: number; fast?: boolean }) {
  const drops = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        duration: (fast ? 0.35 : 0.6) + Math.random() * 0.4,
        delay: Math.random() * 2,
        height: 14 + Math.random() * 14,
      })),
    [count, fast]
  );

  return (
    <>
      {drops.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "-20px",
            left: `${d.left}%`,
            width: 2,
            height: d.height,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.45)",
            animation: `rainFall ${d.duration}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

function LightningFlash() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#fff",
        animation: "lightning 5s ease-in-out infinite",
      }}
    />
  );
}

function FogLayers() {
  const layers = useMemo(
    () =>
      Array.from({ length: 3 }).map((_, i) => ({
        top: 15 + i * 30,
        duration: 18 + i * 6,
        reverse: i % 2 === 0,
      })),
    []
  );

  return (
    <>
      {layers.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${l.top}%`,
            left: "-20%",
            width: "140%",
            height: 60,
            backgroundColor: "rgba(255,255,255,0.5)",
            filter: "blur(18px)",
            animation: `${l.reverse ? "fogDriftReverse" : "fogDrift"} ${l.duration}s ease-in-out infinite`,
          }}
        />
      ))}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const historyHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
};

const filterChips: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const metricsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: 12,
};

const glassButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.16)",
  backdropFilter: "blur(6px)",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: `2px solid ${colors.border}`,
  background: "#f8fafc",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: colors.textMuted,
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: `1px solid ${colors.border}`,
  fontSize: 14,
  color: colors.dark,
};

const globalKeyframes = `
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes cloudDrift {
  from { transform: translateX(0) scale(var(--s, 1)); }
  to { transform: translateX(140vw) scale(var(--s, 1)); }
}
@keyframes rainFall {
  from { transform: translateY(0); opacity: 0.9; }
  to { transform: translateY(240px); opacity: 0.1; }
}
@keyframes lightning {
  0%, 92%, 100% { opacity: 0; }
  93% { opacity: 0.5; }
  94% { opacity: 0; }
  95% { opacity: 0.35; }
  96% { opacity: 0; }
}
@keyframes fogDrift {
  0%, 100% { transform: translateX(0); opacity: 0.6; }
  50% { transform: translateX(6%); opacity: 0.85; }
}
@keyframes fogDriftReverse {
  0%, 100% { transform: translateX(0); opacity: 0.6; }
  50% { transform: translateX(-6%); opacity: 0.85; }
}
.spin {
  animation: spin 1s linear infinite;
}
`;

export default WeatherPage;