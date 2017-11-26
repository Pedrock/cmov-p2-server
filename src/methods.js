'use strict';
const Wreck = require('wreck');
const Moment = require('moment');

const getWeatherHistory = async function (location, day, flags) {
    const key = process.env.APIXU_KEY;
    const { payload } = await Wreck.get(`http://api.apixu.com/v1/history.json?key=${key}&q=${location}&dt=${day}`, { json: 'strict' });
    const ttlDays = Math.min(31, 31 - Moment(day).diff(Moment(), 'days'));
    if (ttlDays > 0) {
        flags.ttl = ttlDays * 24 * 60 * 60 * 1000;
    } else {
        flags.ttl = 6 * 60 * 60 * 1000; // 6 hours
    }
    return payload;
};

const getCurrentWeather = async function (location, flags) {
    const key = process.env.APIXU_KEY;
    const { payload } = await Wreck.get(`http://api.apixu.com/v1/current.json?key=${key}&q=${location}`, { json: 'strict' });
    // TTL the difference between 30 minutes and how many minutes ago the information was updated in the API, with a minimum of 5 minutes
    flags.ttl = Math.max(5 * 60, 30 - (payload.location.localtime_epoch - payload.current.last_updated_epoch)) * 1000;
    return payload;
};

const getWeatherForecast = async function (location) {
    const key = process.env.APIXU_KEY;
    const { payload } = await Wreck.get(`http://api.apixu.com/v1/forecast.json?key=${key}&q=${location}&days=10`, { json: 'strict' });
    return payload;
};

const locationSearch = async function (location, day, flags) {
    const key = process.env.APIXU_KEY;
    const { payload } = await Wreck.get(`http://api.apixu.com/v1/search.json?key=${key}&q=${location}`, { json: 'strict' });
    return payload;
};

module.exports = {
    name: 'methods',
    version: '1.0.0',
    register: function (server, options) {
        server.method('getWeatherHistory', getWeatherHistory, {
            cache: {
                expiresIn: 31 * 24 * 60 * 60 * 1000, // 31 days
                generateTimeout: 10000
            }
        });
        server.method('getCurrentWeather', getCurrentWeather, {
            cache: {
                expiresIn: 5 * 60 * 1000, // 5 minutes
                generateTimeout: 10000
            }
        });
        server.method('getWeatherForecast', getWeatherForecast, {
            cache: {
                expiresIn: 60 * 60 * 1000, // 1 hour
                generateTimeout: 10000
            }
        });
        server.method('locationSearch', locationSearch, {
            cache: {
                expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days
                generateTimeout: 10000
            }
        });
    }
};
