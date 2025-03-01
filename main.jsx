import React, { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

function WeatherApp() {
  const [location, setLocation] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("celsius");
  const [coordinates, setCoordinates] = useState(null);

  async function fetchCoordinates(city) {
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return {
          latitude: data.results[0].latitude,
          longitude: data.results[0].longitude
        };
      }
      throw new Error("Location not found");
    } catch (err) {
      setError("Could not find location. Please try again.");
      return null;
    }
  }

  async function fetchWeatherData(lat, lon) {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=${unit}&wind_speed_unit=mph&timezone=auto`);
      const data = await response.json();
      if (data.current) {
        setWeatherData({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code
        });
        setError(null);
      } else {
        throw new Error("Invalid weather data");
      }
    } catch (err) {
      setError("Failed to fetch weather data");
    }
  }

  const getWeatherCondition = (code) => {
    const conditions = {
      0: "Clear sky ☀️",
      1: "Mainly clear ⛅",
      2: "Partly cloudy 🌤️",
      3: "Overcast ☁️",
      45: "Foggy 🌫️",
      48: "Depositing rime fog 🌫️",
      51: "Light drizzle 🌧️",
      53: "Moderate drizzle 🌧️",
      55: "Dense drizzle 🌧️",
      61: "Slight rain 🌧️",
      63: "Moderate rain 🌧️",
      65: "Heavy rain 🌧️",
      71: "Slight snow fall ❄️",
      73: "Moderate snow fall ❄️",
      75: "Heavy snow fall ❄️",
      77: "Snow grains ❄️",
      80: "Slight rain showers 🌦️",
      81: "Moderate rain showers 🌦️",
      82: "Violent rain showers 🌊",
      95: "Thunderstorm ⛈️",
      96: "Thunderstorm with light hail ⛈️",
      99: "Thunderstorm with heavy hail ⛈️"
    };
    return conditions[code] || "Unknown conditions 🌈";
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) {
      setError("Please enter a city name");
      return;
    }
    const coords = await fetchCoordinates(location);
    if (coords) {
      setCoordinates(coords);
      fetchWeatherData(coords.latitude, coords.longitude);
    }
  };

  const toggleUnit = () => {
    setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  useEffect(() => {
    if (coordinates) {
      fetchWeatherData(coordinates.latitude, coordinates.longitude);
    }
  }, [unit]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🌦️ Weather Tracker</h1>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input 
          type="text" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name"
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>Search</button>
      </form>
      <button onClick={toggleUnit} style={styles.toggleButton}>
        Switch to {unit === 'celsius' ? '°F' : '°C'}
      </button>
      {error && <p style={styles.error}>{error}</p>}
      {weatherData && (
        <div style={styles.weatherCard}>
          <h2>{location}</h2>
          <p>🌡️ {weatherData.temperature}°{unit === 'celsius' ? 'C' : 'F'}</p>
          <p>💧 Humidity: {weatherData.humidity}%</p>
          <p>💨 Wind Speed: {weatherData.windSpeed} mph</p>
          <p>{getWeatherCondition(weatherData.weatherCode)}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '20px', textAlign: 'center', maxWidth: '400px', margin: 'auto', background: '#f3f3f3', borderRadius: '10px' },
  title: { color: '#333' },
  searchForm: { display: 'flex', marginBottom: '10px' },
  searchInput: { flex: 1, padding: '10px', marginRight: '10px' },
  searchButton: { padding: '10px', background: '#4CAF50', color: 'white', border: 'none' },
  toggleButton: { marginBottom: '10px', padding: '10px', background: '#2196F3', color: 'white', border: 'none' },
  weatherCard: { padding: '20px', background: '#fff', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' },
  error: { color: 'red' }
};

createRoot(document.getElementById("root")).render(<WeatherApp />);
