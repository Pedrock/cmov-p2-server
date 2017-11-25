'use strict';
const { exec } = require('child_process');

const run = function (command, callback) {
    const stream = exec(command, {}, () => {
        if (callback) {
            callback();
        }
    });
    stream.stdout.pipe(process.stdout);
    stream.stderr.pipe(process.stderr);
};

run('docker network prune -f', () => {
    run(`docker-compose run -d -p 6379:6379 redis`);
});
