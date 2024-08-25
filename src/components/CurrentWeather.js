import React from 'react';

const CurrentWeather = ({ weather }) => {
  return (
    <div className="weather-details">
      <h2>Today</h2>
      <h3>{weather.name}</h3>
      <p>Temperature: {weather.main.temp}°C</p>
      <p>Min Temperature: {weather.main.temp_min}°C</p>
      <p>Max Temperature: {weather.main.temp_max}°C</p>
      <p>{weather.weather[0].description}</p>
      <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="Weather Icon" />
    </div>
  );
};

export default CurrentWeather;