'use strict';

const _ = require('lodash');
const Moment = require('moment');

exports.getWeatherHistory = async function (request, h) {
    const { location, day } = request.query;
    const dayInfo = JSON.parse(await request.server.methods.getWeatherHistory(location, day));

    return _.chain(dayInfo)
        .get(['forecast', 'forecastday', 0])
        .pick(['day', 'hour'])
        .tap((forecast) => {
            forecast.hour = forecast.hour.reduce((acc, val, i) =>
                (i % 3 === 0 ? [...acc, { ...val, hour: i }] : acc), []);
        })
        .value()
};

exports.getPastDays = async function (request, h) {
    const { location } = request.query;

    const days = _.range(1, 31).map(i => Moment().subtract(i, 'days').format('YYYY-MM-DD'));
    return await Promise.all(days.map(day =>
        request.server.methods.getWeatherHistory(location, day)
            .then(JSON.parse)
            .then(info => _.get(info, ['forecast', 'forecastday', 0, 'day']))
            .then(weather => ({ day, ...weather }))
    ));
}

exports.getCurrent = async function (request, h) {
    const { location } = request.query;
    const obj = JSON.parse(await request.server.methods.getCurrentWeather(location));
    return obj.current;
}