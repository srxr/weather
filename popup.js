"use strict";

const config = {
  MAX_WAITING_TIME: 5000,
  geoip: 'https://geoip-db.com/json/',
  openWeatherApi: 'http://api.openweathermap.org/data/2.5/weather?appid=c992bf26f336b414477fca2ee47efdf0',
  country: null,
  city: null,
  weather: '',
};

/* @returns {wrapped Promise} with .resolve/.reject/.catch methods */
// It goes against Promise concept to not have external access to .resolve/.reject methods, but provides more flexibility
let getWrappedPromise = function() {
  let wrappedPromise = {},
    promise = new Promise(function(resolve, reject) {
      wrappedPromise.resolve = resolve;
      wrappedPromise.reject = reject;
    });
  wrappedPromise.then = promise.then.bind(promise);
  wrappedPromise.catch = promise.catch.bind(promise);
  wrappedPromise.promise = promise; // e.g. if you want to provide somewhere only promise, without .resolve/.reject/.catch methods
  return wrappedPromise;
};

/* @returns {wrapped Promise} with .resolve/.reject/.catch methods */
let getWrappedFetch = function() {
  let wrappedPromise = getWrappedPromise();
  let args = Array.prototype.slice.call(arguments); // arguments to Array
  fetch.apply(null, args) // calling original fetch() method
    .then(function(response) {
      wrappedPromise.resolve(response);
    }, function(error) {
      wrappedPromise.reject(error);
    }).catch(function(error) {
      wrappedPromise.catch(error);
    });
  return wrappedPromise;
};

let processStatus = function(response) {
  // status "0" to handle local files fetching (e.g. Cordova/Phonegap etc.)
  if (response.status === 200 || response.status === 0) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
};

let parseJson = function(response) {
  return response.json();
};

/**
 * Fetch JSON by url
 * @param { {
 *  url: {String},
 *  [cache]: {Boolean}
 * } } params
 * @returns {Promise}
 */
let request = function(params) {
  let wrappedFetch = getWrappedFetch(params.cache ? params.url : params.url + '?' + new Date().getTime(), {
    method: params.method || 'get', // optional, "GET" is default value
    headers: {
      'Accept': 'application/json'
    }
  });
  let timeoutId = setTimeout(function() {
    wrappedFetch.reject(new Error('Load timeout for resource: ' + params.url)); // reject on timeout
  }, config.MAX_WAITING_TIME);
  return wrappedFetch.promise // getting clear promise from wrapped
    .then(function(response) {
      clearTimeout(timeoutId);
      return response;
    }).then(processStatus).then(parseJson);
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
        <span class="row weather-detail" id="weather-detail">${data.weather[0].main}</span>
        <span class="row temperature-detail" id="temperature-detail">${data.main.temp}</span>
        <span class="row humidity-detail" id="humidity-detail">${data.main.humidity}</span>
        <span class="row wind-detail" id="wind-detail">${data.wind.speed}</span>
      </aside>
      <footer class="footer">
        <span class="info">info</span>
      </footer>
    </div>
  `;
};

let saveWeatherData = function(data = {}) {
  let result = Object.assign(data, {createdAt: new Date().getTime() });
  console.log(result);
  return chrome.storage.local.set({ "weatherData": result });
};

let getWeatherData = function() {
  chrome.storage.local.get(["weatherData"], function(items){
    // console.log(items.weatherData);
    return items.weatherData;
  });
};

let getWeather = function(params = {}) {
  const url = config.openWeatherApi + `&q=${params.city},${params.country}`;
  request({
    url: url,
    cache: false
  }).then(function(response) {
    // console.log(response);
    saveWeatherData(response);
    parseWeather(response);
  }, function(error) {
    console.error('An error occured!');
    console.error(error.message ? error.message : error);
  });
};

document.addEventListener('DOMContentLoaded', function(data) {
  request({
    url: config.geoip,
    cache: true
  }).then(function(response) {
    chrome.storage.local.get(["weatherData"], function(items){
      const data = items.weatherData;
      const lastCreated = data.createdAt;
      const now = new Date().getTime();
      const timeDiff = now - lastCreated;
      // ten miuntes
      if (data && timeDiff < 600000) {
        parseWeather(items.weatherData);
      } else {
        getWeather({ country: response.country_code, city: response.city });
      }
    });
  }, function(error) {
    console.error('An error occured!');
    console.error(error.message ? error.message : error);
  });
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
