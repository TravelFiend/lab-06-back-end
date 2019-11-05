require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const geoData = require('./data/geo.json');


const PORT = process.env.PORT;

app.use(cors());

app.use(express.static('./public'));

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

const getLatLng = (location) => {
    if (location === 'bad location') {
        throw new Error();
    }

    return toLocation(geoData);
}; 

const toLocation = () => {

    const firstResult = geoData.results[0];
    const geometry = firstResult.geometry;

    return {
        formatted_query : firstResult.formatted_address,
        latitude : geometry.location.lat,
        longitude : geometry.location.lng,
    };
};

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});

