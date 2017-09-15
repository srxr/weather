"use strict";

console.log("I am popup.js");

let config = {
  geoip: 'https://geoip-db.com/json/',
  openWeatherApi: 'http://api.openweathermap.org/data/2.5/weather?appid=c992bf26f336b414477fca2ee47efdf0',
  country: null,
  city: null,
  weather: '',
};

let weatherData = {"coord":{"lon":113.25,"lat":23.12},"weather":[{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}],"base":"stations","main":{"temp":302.15,"pressure":1011,"humidity":54,"temp_min":302.15,"temp_max":302.15},"visibility":10000,"wind":{"speed":2,"deg":110},"clouds":{"all":75},"dt":1505437200,"sys":{"type":1,"id":7414,"message":0.0107,"country":"CN","sunrise":1505427211,"sunset":1505471438},"id":1809858,"name":"Guangzhou","cod":200};

let parseWeather = function(data) {
  header: {
    console.log(data);
  }

  aside: {
    console.log('aside');
  }
};

parseWeather(weatherData);

var request = window.superagent;
console.log(request);

/**
 * Geo location
 * @return {Object}
 */
var geo = function() {
  /*fetch('https://geoip-db.com/json/')
    .then(function(response) {
      return response.json();
    }).then(function(json) {
      console.log('parsed json', json);
      return json;
    }).catch(function(ex) {
      console.log('parsing failed', ex);
    });*/
  request
    .get(config.geoip)
    .end(function(err, res){
      console.log(res);
      return res;
    });
};

console.log(geo());

document.addEventListener('DOMContentLoaded', function(data) {
  document.body.innerHTML = `
    <div class="wrapper">
      <header class="header" id="header">城市天气</header>
      <aside class="aside aside-1">
        <span class="row weather">天气</span>
        <span class="row temperature">温度</span>
        <span class="row humidity">湿度</span>
        <span class="row wind">风速</span>
      </aside>
      <aside class="aside aside-2">
        <span class="row weather-detail" id="weather-detail">天气</span>
        <span class="row temperature-detail" id="temperature-detail">温度</span>
        <span class="row humidity-detail" id="humidity-detail">湿度</span>
        <span class="row wind-detail" id="wind-detail">风速</span>
      </aside>
      <footer class="footer">
        <span class="info">info</span>
      </footer>
    </div>
  `;
});

/*document.addEventListener('click', function(r) {
  console.log('click');
  hello();
}, false);

function hello() {
  chrome.runtime.sendMessage({
    greeting: "hello"
  },
  function(response) {
    // document.body.textContent = response.msg;
    const header = document.querySelector('.header');
    console.log(header);
    header.replace(weatherData.name);
    header.style.backgroundColor = 'red';
  });
}*/
