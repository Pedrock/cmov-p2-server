'use strict';

const _ = require('lodash');
const Moment = require('moment');

const filterHours = function (hours) {
    return hours.reduce((acc, val, i) =>
        (i % 3 === 0 ? [...acc, { ...val, hour: i }] : acc), []);
};

exports.getWeatherHistory = async function (request, h) {
    const { location, day } = request.query;
    const dayInfo = await request.server.methods.getWeatherHistory(location, day);

    return _.chain(dayInfo)
        .get(['forecast', 'forecastday', 0])
        .pick(['day', 'hour'])
        .tap((forecast) => {
            forecast.hour = filterHours(forecast.hour);
        })
        .value()
};

exports.getPastDays = async function (request, h) {
    const { location } = request.query;
    const days = _.range(1, 31).map(i => Moment().subtract(i, 'days').format('YYYY-MM-DD'));

    return await Promise.all(days.map(day =>
        request.server.methods.getWeatherHistory(location, day)
            .then(info => _.get(info, ['forecast', 'forecastday', 0, 'day']))
            .then(weather => ({ day, ...weather }))
    ));
};

exports.getCurrent = async function (request, h) {
    const { location } = request.query;
    const obj = await request.server.methods.getCurrentWeather(location);

    return obj.current;
};

exports.getForecast = async function (request, h) {
    const { location } = request.query;
    const obj = await request.server.methods.getWeatherForecast(location);

    return obj.forecast.forecastday.map((day) => {
        day.hour = filterHours(day.hour);
        return _.pick(day, ['date', 'date_epoch', 'day', 'hour']);
    });
};

exports.locationSearch = async function (request, h) {
    const { q } = request.query;
    const list = await request.server.methods.locationSearch(q);

    return list.map(item => _.pick(item, ['id', 'name']));
};