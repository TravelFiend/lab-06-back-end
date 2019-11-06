require('dotenv').config();
const express = require('express');
const cors = require('cors');
const geoData = require('./data/geo.json');
const weatherData = require('./data/darksky.json');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.static('./public'));

const toLocation = () => {
    const firstResult = geoData.results[0];
    const geometry = firstResult.geometry;
    
    return {
        formatted_query : firstResult.formatted_address,
        latitude : geometry.location.lat,
        longitude : geometry.location.lng,
    };
};

const getLatLng = (location) => {
    if (location === 'bad location') {
        throw new Error();
    }
    
    return toLocation(geoData);
}; 

app.get('/location', (req, res) => {
    try {
        const location = req.query.location;
        const result = getLatLng(location);
        res.status(200).json(result);
    }
    catch (err){
        res.status(500).send('Hey, it did not work. Try again.');
    }
});

app.get('/weather', (req, res) => {
    try {
        const weather = req.query.weather;
        const result = getWeather(weather);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(500).send('Error, try again!');
    }
});

const getWeather = () => {
    if (weather === 'bad weather'){
        throw new Error();
    }
    return toWeather(weatherData);
};

const toWeather = () => {
    const firstResult = weatherData.daily.data;
};

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});

