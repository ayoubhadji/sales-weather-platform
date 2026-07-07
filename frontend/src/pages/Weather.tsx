import { useEffect, useState } from "react";
import api from "../services/api";
import type { Weather } from "../types/Weather";

function WeatherPage() {
  const [weather, setWeather] = useState<Weather[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeather();
  }, []);

  async function loadWeather() {
    try {
      const response = await api.get("/weather");
      setWeather(response.data);
    } catch (error) {
      console.error("Error loading weather:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>Weather History</h1>

      <table border={1} cellPadding={10}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Temperature</th>
            <th>Humidity</th>
            <th>Rainfall</th>
            <th>Wind Speed</th>
            <th>Condition</th>
          </tr>
        </thead>

        <tbody>
          {weather.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.weatherDate}</td>
              <td>{item.temperature} °C</td>
              <td>{item.humidity}%</td>
              <td>{item.rainfall} mm</td>
              <td>{item.windSpeed} km/h</td>
              <td>{item.weatherCondition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WeatherPage;