'use strict';

const _ = require('lodash');
const Moment = require('moment');

const filterHours = function (hours) {
    return hours.reduce((acc, val, i) =>
        (i % 3 === 0 ? [...acc, { ...val, hour: i }] : acc), []);
};

const getDayInfo = function (day) {
    const m = Moment(day);
    return {
        date: m.format('YYYY-MM-DD'),
        week_day: m.format('dddd'),
        day_month: m.format('MMMM Do'),
        year: m.format('YYYY')
    }
};

const fixWeatherCondition = function(weather) {
    const { condition } = weather;
    const matches = /.+(day|night)\/([0-9]+)\..+/.exec(condition.icon);
    if (matches && matches.length === 3) {
        condition.icon = `${matches[1]}_${matches[2]}.png`;
    }
    return weather;
};

exports.getWeatherHistory = async function (request, h) {
    const { location, day } = request.query;
    const dayInfo = await request.server.methods.getWeatherHistory(location, day);

    return _.chain(dayInfo)
        .get(['forecast', 'forecastday', 0])
        .pick(['day', 'hour', 'astro'])
        .tap((forecast) => {
            forecast.day = { ...getDayInfo(day), ...fixWeatherCondition(forecast.day) };
            forecast.hour = filterHours(forecast.hour).map(fixWeatherCondition);
        })
        .value()
};

exports.getPastDays = async function (request, h) {
    const { location } = request.query;

    const currentWeather = await request.server.methods.getCurrentWeather(location);
    const localTime = currentWeather.location.localtime;

    const days = _.range(1, 31).map(i => Moment(localTime).subtract(i, 'days').format('YYYY-MM-DD'));

    return await Promise.all(days.map(day =>
        request.server.methods.getWeatherHistory(location, day)
            .then(info => _.get(info, ['forecast', 'forecastday', 0, 'day']))
            .then(fixWeatherCondition)
            .then(weather => ({ ...getDayInfo(day), ...weather }))
    ));
};

exports.getCurrent = async function (request, h) {
    const { location } = request.query;
    const obj = await request.server.methods.getCurrentWeather(location);
    return fixWeatherCondition({ ...getDayInfo(obj.current.last_updated), ...obj.current});
};

exports.getForecast = async function (request, h) {
    const { location } = request.query;
    const obj = await request.server.methods.getWeatherForecast(location);

    return obj.forecast.forecastday.map((forecast) => {
        forecast.day = { ...getDayInfo(forecast.date), ...fixWeatherCondition(forecast.day) };
        forecast.hour = filterHours(forecast.hour).map(fixWeatherCondition);
        return _.pick(forecast, ['day', 'hour', 'astro']);
    });
};

exports.locationSearch = async function (request, h) {
    const { q } = request.query;
    const list = await request.server.methods.locationSearch(q);

    return list
        .map(item => _.pick(item, ['id', 'name', 'region', 'country']))
        .map(item => {
            const [location] = item.name.split(',', 1);
            return { ...item, location };
        })
};

exports.getCitiesInfo = async function (request, h) {
    const ids = request.query.ids.split(',');
    return Promise.all(ids.map(async (id) => {
        const obj = await request.server.methods.getCurrentWeather(`id:${id}`);
        const info = fixWeatherCondition(obj.current);
        return {
            temp_c: info.temp_c,
            icon: info.condition.icon
        }
    }))
};