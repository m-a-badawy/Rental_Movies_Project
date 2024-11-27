const winston = require('winston');
require('express-async-errors');
require('winston-mongodb');

module.exports = () => {
    winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        transports: [
            new winston.transports.Console(),
            new winston.transports.File({ filename: 'error.log' }),
            new winston.transports.MongoDB({
                db: 'mongodb://localhost:27017/Vidly',
                db: 'mongodb://localhost:27017/Vidly_test',
                level: 'info'
            })
        ],
        exceptionHandlers: [
            new winston.transports.File({ filename: 'ExceptionHandler.log' })
        ],
        rejectionHandlers: [
            new winston.transports.File({ filename: 'rejectionHandler.log' })
        ]
    });
};

winston.add(new winston.transports.Console({
    format: winston.format.simple()
}));
