'use strict';

require('dotenv-safe').load({ allowEmptyValues: true });
const Hapi = require('hapi');

const server = new Hapi.Server({
    host: 'localhost',
    port: 3000,
    cache: {
        engine: require('catbox-redis'),
        host: process.env.REDIS_HOST || '127.0.0.1'
    }
});

const runServer = async function () {
    await server.register({ plugin: require('./methods') });
    await server.register({ plugin: require('./routes/routes') });
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

runServer();
