'use strict';

const Handlers = require('./handlers');
const Schema = require('./schema');

module.exports = {
    name: 'routes',
    version: '1.0.0',
    register: function (server, options) {
        server.route([
            {
                method: 'GET',
                path: '/history',
                config: {
                    tags: ['api'],
                    handler: Handlers.getWeatherHistory,
                    validate: Schema.getWeatherHistory
                }
            },
            {
                method: 'GET',
                path: '/past-days',
                config: {
                    tags: ['api'],
                    handler: Handlers.getPastDays,
                    validate: Schema.getPastDays
                }
            },
            {
                method: 'GET',
                path: '/current',
                config: {
                    tags: ['api'],
                    handler: Handlers.getCurrent,
                    validate: Schema.getCurrent
                }
            },
            {
                method: 'GET',
                path: '/forecast',
                config: {
                    tags: ['api'],
                    handler: Handlers.getForecast,
                    validate: Schema.getForecast
                }
            },
            {
                method: 'GET',
                path: '/search',
                config: {
                    tags: ['api'],
                    handler: Handlers.locationSearch,
                    validate: Schema.locationSearch
                }
            }
        ]);
    }
};
