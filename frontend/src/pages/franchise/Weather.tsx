import { useEffect, useState } from "react";
import api from "../../services/api";
import type { Weather } from "../../types/Weather";
import PageHeader from "../../components/PageHeader";
import { card, colors } from "../../styles/common";
import { CloudSun, RotateCcw } from "lucide-react";

function WeatherPage() {
  const [weather, setWeather] = useState<Weather[]>([]);
  const [currentWeather, setCurrentWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <div>
      <PageHeader
        icon={CloudSun}
        title="Weather"
        description="Current weather plus historical records used for sales decisions."
      />

      {loading ? (
        <p style={{ color: colors.textMuted }}>Loading weather data...</p>
      ) : (
        <>
          <section style={{ ...card, marginBottom: 20 }}>
            <div style={headerRowStyle}>
              <div>
                <h2 style={{ margin: 0 }}>Current Weather</h2>
                <p style={{ margin: "6px 0 0", color: colors.textMuted }}>
                  Latest snapshot from the weather service.
                </p>
              </div>
              <button onClick={refreshCurrentWeather} disabled={refreshing} style={refreshButtonStyle}>
                <RotateCcw size={16} />
                {refreshing ? "Refreshing..." : "Import current weather"}
              </button>
            </div>

            {currentWeather ? (
              <div style={currentGrid}>
                <Metric label="Date" value={currentWeather.weatherDate} />
                <Metric label="Temperature" value={`${currentWeather.temperature} °C`} />
                <Metric label="Humidity" value={`${currentWeather.humidity}%`} />
                <Metric label="Rainfall" value={`${currentWeather.rainfall} mm`} />
                <Metric label="Wind speed" value={`${currentWeather.windSpeed} km/h`} />
                <Metric label="Condition" value={currentWeather.weatherCondition} />
              </div>
            ) : (
              <p style={{ color: colors.textMuted }}>No current weather available.</p>
            )}
          </section>

          <section style={card}>
            <h2 style={{ marginTop: 0 }}>Weather History</h2>
            {weather.length === 0 ? (
              <p style={{ color: colors.textMuted }}>No historical weather records found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Temperature</th>
                      <th style={thStyle}>Humidity</th>
                      <th style={thStyle}>Rainfall</th>
                      <th style={thStyle}>Wind speed</th>
                      <th style={thStyle}>Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weather.map((entry) => (
                      <tr key={entry.id}>
                        <td style={tdStyle}>{entry.weatherDate}</td>
                        <td style={tdStyle}>{entry.temperature} °C</td>
                        <td style={tdStyle}>{entry.humidity}%</td>
                        <td style={tdStyle}>{entry.rainfall} mm</td>
                        <td style={tdStyle}>{entry.windSpeed} km/h</td>
                        <td style={tdStyle}>{entry.weatherCondition}</td>
                      </tr>
                    ))}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={metricCardStyle}>
      <div style={{ color: colors.textMuted, fontSize: 13 }}>{label}</div>
      <div style={{ marginTop: 6, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 18,
  flexWrap: "wrap",
};

const refreshButtonStyle: React.CSSProperties = {
  background: colors.dark,
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  cursor: "pointer",
};

const currentGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 12,
};

const metricCardStyle: React.CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: 14,
  padding: 14,
  background: "#f8fafc",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: `1px solid ${colors.border}`,
  background: "#f8fafc",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: `1px solid ${colors.border}`,
};

export default WeatherPage;