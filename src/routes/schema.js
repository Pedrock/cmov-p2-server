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
