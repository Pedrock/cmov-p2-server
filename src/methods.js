'use strict';
const Wreck = require('wreck');

const getWeatherHistory = async function (location, day) {
    const key = process.env.APIXU_KEY;
    const { payload } = await Wreck.get(`http://api.apixu.com/v1/history.json?key=${key}&q=${location}&dt=${day}`);
    return payload.toString();
};

const getCurrentWeather = async function (location) {
    const key = process.env.APIXU_KEY;
    const { payload } = await Wreck.get(`http://api.apixu.com/v1/current.json?key=${key}&q=${location}`);
    return payload.toString();
};

module.exports = {
    name: 'methods',
    version: '1.0.0',
    register: function (server, options) {
        server.method('getWeatherHistory', getWeatherHistory, {
            cache: {
                expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days
                generateTimeout: 10000
            }
        });
        server.method('getCurrentWeather', getCurrentWeather, {
            cache: {
                expiresIn: 5 * 60 * 1000, // 5 minutes
                generateTimeout: 10000
            }
        });
    }
};
