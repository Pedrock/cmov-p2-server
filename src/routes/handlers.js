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
        .pick(['day', 'hour'])
        .tap((forecast) => {
            fixWeatherCondition(forecast.day);
            forecast.hour = filterHours(forecast.hour).map(fixWeatherCondition);
        })
        .thru((forecast) => ({ ...getDayInfo(day), ...forecast }))
        .value()
};

exports.getPastDays = async function (request, h) {
    const { location } = request.query;
    const days = _.range(1, 31).map(i => Moment().subtract(i, 'days').format('YYYY-MM-DD'));

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

    return obj.forecast.forecastday.map((day) => {
        fixWeatherCondition(day.day);
        day.hour = filterHours(day.hour).map(fixWeatherCondition);
        const obj = _.pick(day, ['date', 'date_epoch', 'day', 'hour']);
        return { ...getDayInfo(day), ...obj }
    });
};

exports.locationSearch = async function (request, h) {
    const { q } = request.query;
    const list = await request.server.methods.locationSearch(q);

    return list.map(item => _.pick(item, ['id', 'name']));
};