'use strict';

const Joi = require('joi');

exports.getWeatherHistory = {
    query: {
        location: Joi.string().required(),
        day: Joi.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).required()
    }
};

exports.getPastDays = {
    query: {
        location: Joi.string().required()
    }
};

exports.getCurrent = {
    query: {
        location: Joi.string().required()
    }
};

exports.getForecast = {
    query: {
        location: Joi.string().required()
    }
};

exports.locationSearch = {
    query: {
        q: Joi.string().required()
    }
};

exports.getCitiesInfo = {
    query: {
        ids: Joi.string().regex(/^[0-9]+(,[0-9]+)*$/).required()
    }
};
