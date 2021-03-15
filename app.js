require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');

const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post('/', function (req, res) {
  const query = req.body.cityName
  const apiKey = process.env.API_KEY
  const geoUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + query + "&limit=5&appid=" + apiKey

  http.get(geoUrl, function (geoResponse) {
    geoResponse.on("error", function (err) {
      console.log(err);
      return res.redirect('/');
    })


    console.log(geoResponse.statusCode);
    geoResponse.on('data', function (geoData) {
      if (geoResponse.statusCode != 200) {
        return res.redirect('/');
      }

      const coordinationData = JSON.parse(geoData);
      console.log(coordinationData);
      if (!coordinationData.length) {
        return res.redirect('/');
      }
      const lat = coordinationData[0].lat;
      const lon = coordinationData[0].lon;

      console.log(`${lat} ${lon}`);

      const forecastURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=metric&exclude=minutely,hourly&appid=" + apiKey
      
      https.get(forecastURL, function (forecastResponse) {
        console.log(forecastResponse.statusCode);

        forecastResponse.on('data', function (weatherData) {
          const forecastData = JSON.parse(weatherData);

          const todayMaxTemp = forecastData.daily[0].temp.max;

          res.write(`<p>Today's max temp: ${todayMaxTemp} </p>`);
          res.send();
        });
      });


    });
  });
});

// const url = "http://api.openweathermap.org/data/2.5/forecast?q=" + query + "&units=" + units + "&appid=" + apiKey

app.listen(3000, function () {
  console.log('Server is running on port 3000.');
});