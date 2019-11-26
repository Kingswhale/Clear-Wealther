// Using open Weather Api to 
// wirte a waether app with node js

const request = require('request');
const argv = require('yargs').argv;

let apiKey = '30d0bb5e29e3e81dd5d132e8fe8547c2';
let city = argv.c || 'portland';
//let city = 'portland'
let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`

request(url, function (err, response, body) {
    if(err){
      console.log('error:', error);
    } else {
      let weather = JSON.parse(body);
      let message = `It's ${weather.main.temp} degrees in ${weather.name}!`;
      console.log(message);
    }
  });
