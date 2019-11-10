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
            imgSmall: trail.imgSmall,
            stars: trail.stars,
            votes: trail.starVotes,
            length: trail['length']
        };
    });
    return trailsArr;
};


// "type": "Featured Hike", "summary": "Widely recognized as one of the best urban trails in the country.", "difficulty": "green", "starVotes": 13,"url": "https://www.hikingproject.com/trail/7008385/highline-canal-trail", "imgSqSmall": "https://cdn-files.apstatic.com/hike/7007020_sqsmall_1554321989.jpg", "imgSmall": "https://cdn-files.apstatic.com/hike/7007020_small_1554321989.jpg", "imgSmallMed": "https://cdn-files.apstatic.com/hike/7007020_smallMed_1554321989.jpg", "imgMedium": "https://cdn-files.apstatic.com/hike/7007020_medium_1554321989.jpg", "length": 61.3, "ascent": 369, "descent": -468, "high": 5549, "low": 5435, "longitude": -105.0908, "latitude": 39.487, "conditionStatus": "Unknown", "conditionDetails": null, "conditionDate": "1970-01-01 00:00:00" }

app.get('/trails', async(req, res) => {
    const ourTrail = await getTrails(latAndLng.latitude, latAndLng.longitude);

    res.status(200).json(ourTrail);
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});

