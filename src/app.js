const express = require('express');
const winston = require('winston');

const app = express();

require('../startUp/validation')();
require('../startUp/logging')();
require('../startUp/config')();
require('../startUp/routes')(app);
require('../startUp/db')();
require('../startUp/production.js')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    winston.info(`Listening on port ${port}...`);
});

module.exports = server;
