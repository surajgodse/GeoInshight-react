import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CurrentWeather from './CurrentWeather';
import Forecast from './Forecast';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_KEY = 'b65ff0940dfde6a3283d2d7ccfdd8a17';

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const GeoInsight = () => {
  const [city, setCity] = useState('');
  const [geoData, setGeoData] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    fetchUserLocation();
    fetchIpAddress();
  }, []);

  const fetchIpAddress = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      setIpAddress(response.data.ip);
    } catch (error) {
      console.error('Failed to fetch IP address:', error);
    }
  };

  const fetchUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchGeoData(null, latitude, longitude);
      },
      (error) => {
        console.error("Error getting user's location:", error);
        setError("Unable to get your location. Please enter a city name.");
      }
    );
  };

  const fetchGeoData = async (cityName, lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (cityName) {
        url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
      } else {
        url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
      }
      const response = await axios.get(url);
      if (response.data && response.data.length > 0) {
        const locationData = response.data[0];
        setGeoData(locationData);
        fetchWeather(locationData.lat, locationData.lon);
      } else {
        setError('Location not found. Please try another city.');
      }
    } catch (error) {
      setError('Failed to fetch location data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      setCurrentWeather(currentWeatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      setForecast(forecastResponse.data.list.filter((reading) => reading.dt_txt.includes("12:00:00")));
    } catch (error) {
      console.error('Failed to fetch weather data');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchGeoData(city);
  };

  return (
    <div className="geoinsight-container">
      <h1>GeoInsight</h1>
      <form className="geoinsight-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter City Name"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {geoData && (
        <div className="geoinsight-content">
          <div className="map-and-coordinates">
            <div className="map-container">
              <MapContainer center={[geoData.lat, geoData.lon]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={[geoData.lat, geoData.lon]} zoom={12} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[geoData.lat, geoData.lon]}>
                  <Popup>{geoData.name}</Popup>
                </Marker>
              </MapContainer>
            </div>
            <div className="coordinates-info">
              <h2>Location Details</h2>
              <p><strong>IP Address:</strong> {ipAddress}</p>
              <p><strong>City:</strong> {geoData.name}</p>
              <p><strong>Country:</strong> {geoData.country}</p>
              <p><strong>Latitude:</strong> {geoData.lat.toFixed(4)}</p>
              <p><strong>Longitude:</strong> {geoData.lon.toFixed(4)}</p>
            </div>
          </div>
          <div className="weather-info">
            {currentWeather && <CurrentWeather weather={currentWeather} />}
            {forecast.length > 0 && <Forecast forecast={forecast} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeoInsight;