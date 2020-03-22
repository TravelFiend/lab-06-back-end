require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.static('./public'));
let latAndLng;

const toLocation = placeItem => {
    const {
        geometry: {
            location: {
                lat,
                lng
            },
        },
        formatted_address
    } = placeItem;

    return {
        formatted_query: formatted_address,
        latitude : lat,
        longitude : lng
    };
};

app.get('/location', async(req, res) => {
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const queryParams = req.query.search;
    const actualLocation = await superagent.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${queryParams}&key=${mapsApiKey}`);
    const parsedLocation = JSON.parse(actualLocation.text).results[0];
    const response = toLocation(parsedLocation);

    latAndLng = response;
    res.json(response);
});

const getWeather = async(lat, lng) => { 
    const darkskyApikey = process.env.DARKSKY_KEY;
    const actualWeather = await superagent.get(`https://api.darksky.net/forecast/${darkskyApikey}/${lat},${lng}`);
    const parsedWeather = JSON.parse(actualWeather.text);

    const newWeatherArray = (parsedWeather.daily.data).map(weatherItem => {
        return {
            forecast : weatherItem.summary,
            time : new Date(weatherItem.time * 1000).toDateString()
        };
    });
    return newWeatherArray;
};

app.get('/weather', async(req, res) => {
    const ourWeather = await getWeather(latAndLng.latitude, latAndLng.longitude);

    res.status(200).json(ourWeather);
});

const getTrails = async(lat, lng) => {
    const trailsApiKey = process.env.TRAILS_KEY;
    const trailsStr = await superagent.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lng}&maxDistance=10&key=${trailsApiKey}`);
    const parsedRes = JSON.parse(trailsStr.text);

    const trailsArr = (parsedRes.trails).map(trail => {
        return {
            name: trail.name,
            location: trail.location,
            stars: trail.stars,
            star_votes: trail.starVotes,
            length: trail['length'],
            conditions: trail.conditionStatus,
            condition_date: trail.conditionDate.slice(0, 10),
            condition_time: trail.conditionDate.slice(11),
            summary: trail.summary
        };
    });
    return trailsArr;
};

app.get('/trails', async(req, res) => {
    const ourTrail = await getTrails(latAndLng.latitude, latAndLng.longitude);

    res.status(200).json(ourTrail);
});

const getYelp = async(lat, lng) => {
    const yelpApiKey = process.env.YELP_KEY;
    const yelpStr = await superagent.get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}`).set(`Authorization`, `Bearer ${yelpApiKey}`);
    const parsedYelp = JSON.parse(yelpStr.text);

    const yelpArr = (parsedYelp.businesses).map(business => {
        return {
            name: business.name,
            image_url: business.image_url,
            price: business.price,
            rating: business.rating,
            url: business.url
        };
    });
    return yelpArr;
};

app.get('/reviews', async(req, res) => {
    const ourYelp = await getYelp(latAndLng.latitude, latAndLng.longitude);

    res.status(200).json(ourYelp);
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});

