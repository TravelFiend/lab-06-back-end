require('dotenv').config();
const express = require('express');
const cors = require('cors');
const geoData = require('./data/geo.json');
const weatherData = require('./data/darksky.json');
const superagent = require('superagent');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.static('./public'));
// let latAndLng;

const toLocation = () => {
    const firstResult = geoData.results[0];
    const geometry = firstResult.geometry;
    
    return {
        formatted_query : firstResult.formatted_address,
        latitude : geometry.location.lat,
        longitude : geometry.location.lng,
    };
};

// const getLatLng = (location) => {
//     if (location === 'bad location') {
//         throw new Error();
//     }
    
//     return toLocation(geoData);
// }; 

app.get('/location', async(req, res) => {

    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const queryParams = req.query.search;
    const actualLocation = await superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${queryParams}&key=${mapsApiKey}`);
    const parsedLocation = JSON.parse(actualLocation.text).results[0];
    const response = toLocation(parsedLocation);

    // latAndLng = response;
    res.json(response);

});

const toWeather = () => {
    const firstResult = weatherData.daily.data[0];

    return {
        forecast: firstResult.summary,
        time: new Date(firstResult.time).toDateString()
    };
};

app.get('/weather', (req, res) => {
    try {
        const weather = req.query.weather;
        const result = toWeather(weather);
        res.status(200).json([result]);
    }
    catch (err) {
        res.status(500).send('Error, try again!');
    }
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});

