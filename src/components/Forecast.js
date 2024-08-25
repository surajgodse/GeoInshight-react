import React from 'react';

const Forecast = ({ forecast }) => {
  return (
    <div className="forecast-container">
      {forecast.map((weather, index) => (
        <div key={index} className="forecast-item">
          <h4>{new Date(weather.dt_txt).toLocaleDateString("en-US", { weekday: 'long' })}</h4>
          <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="Weather Icon" />
          <p>{weather.main.temp}°C</p>
        </div>
      ))}
    </div>
  );
};

export default Forecast;