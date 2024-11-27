const winston = require('winston');
const config = require('config');

module.exports = () => {
    if (!config.has('jwtPrivateKey')) {
        throw new Error('FATAL error: jwtPrivateKey is not defined.');
    }    
};
