"use strict";

let translate = {
  weather: function(weather) {
    switch (weather.toLowerCase()) {
      case 'clear': {
        return '晴';
      }
      case 'clouds': {
        return '多云';
      }
      default: {
        return weather;
      }
    }
  }
};

let parseWeather = function(data = {}) {
  header: {
    // console.log(data);
  }
  aside: {
    // console.log('aside');
  }
  document.body.innerHTML = `
    <div class="wrapper">
      <header class="header" id="header">${data.name}天气</header>
      <aside class="aside aside-1">
        <span class="row weather">天气</span>
        <span class="row temperature">温度</span>
        <span class="row humidity">湿度</span>
        <span class="row wind">风速</span>
      </aside>
      <aside class="aside aside-2">
        <span class="row weather-detail" id="weather-detail">${translate.weather(data.weather[0].main)}</span>
        <span class="row temperature-detail" id="temperature-detail">${data.main.temp - 273.15}°C</span>
        <span class="row humidity-detail" id="humidity-detail">${data.main.humidity}%</span>
        <span class="row wind-detail" id="wind-detail">${data.wind.speed}</span>
      </aside>
      <footer class="footer">
        <span class="info">info</span>
      </footer>
    </div>
  `;
};

chrome.runtime.sendMessage({
  sendMessage: "Get weather data"
}, function(response) {
  console.log(response)
  parseWeather(response)
});
