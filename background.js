const config = {
  MAX_WAITING_TIME: 5000,
  geoip: 'https://geoip-db.com/json/',
  openWeatherApi: 'http://api.openweathermap.org/data/2.5/weather?appid=c992bf26f336b414477fca2ee47efdf0',
  weather: ['clouds', 'main', 'name', 'weather', 'wind', 'timestamps']
};

const request = {
  /**
   * It goes against Promise concept to not have external access to .resolve/.reject methods, but provides more flexibility
   * @returns {wrapped Promise} with .resolve/.reject/.catch methods
   */
  getWrappedPromise: function() {
    let wrappedPromise = {},
      promise = new Promise(function(resolve, reject) {
        wrappedPromise.resolve = resolve;
        wrappedPromise.reject = reject;
      });
    wrappedPromise.then = promise.then.bind(promise);
    wrappedPromise.catch = promise.catch.bind(promise);
    wrappedPromise.promise = promise; // e.g. if you want to provide somewhere only promise, without .resolve/.reject/.catch methods
    return wrappedPromise;
  },

  /**
   * @returns {wrapped Promise} with .resolve/.reject/.catch methods
   */
  getWrappedFetch: function() {
    let wrappedPromise = this.getWrappedPromise();
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
  },

  processStatus: function(response) {
    // status "0" to handle local files fetching (e.g. Cordova/Phonegap etc.)
    if (response.status === 200 || response.status === 0) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(response.statusText))
    }
  },

  parseJson: function(response) {
    return response.json();
  },

  /**
   * Fetch JSON by url
   * @param { {
   *  url: {String},
   *  [cache]: {Boolean}
   * } } params
   * @returns {Promise}
   */
  fetch: function(params) {
    let wrappedFetch = this.getWrappedFetch(params.cache ? params.url : params.url + '?' + new Date().getTime(), {
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
      }).then(this.processStatus).then(this.parseJson);
  }
};

let weather = {
  save: function(data = {}) {
    const result = Object.assign(data, {timestamps: new Date().getTime() });
    chrome.storage.sync.set(result);
  },

  get: function(params = {}) {
    const url = config.openWeatherApi + `&q=${params.city},${params.country}`;
    request.fetch({
      url: url,
      cache: false
    }).then(function(response) {
      weather.save(response);
    }, function(error) {
      console.error('An error occured!');
      console.error(error.message ? error.message : error);
    });
  },

  refresh: function() {
    request.fetch({
      url: config.geoip,
      cache: true
    }).then(function(response) {
      chrome.storage.sync.get(config.weather, function(items){
        const now = new Date().getTime();
        const lastCreated = items.timestamps;
        const timeDiff = now - lastCreated;
        if (!items || !lastCreated || !timeDiff || timeDiff > 600000) {
          weather.get({ country: response.country_code, city: response.city });
        }
      });
    }, function(error) {
      console.error('An error occured!');
      console.error(error.message ? error.message : error);
    });
  }
};

document.addEventListener('DOMContentLoaded', function(data) {
  weather.refresh();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(request)
  chrome.storage.sync.get(config.weather, function(items){
    weather.refresh();
    sendResponse(items);
  });

  return true;
});
