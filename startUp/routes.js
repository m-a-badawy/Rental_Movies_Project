const customer = require('../routes/customerRoutes'); // Changed to require
const returns = require('../routes/returnRoutes');
const rentals = require('../routes/rentalRoutes'); // Changed to require
const movies = require('../routes/moviesRoutes'); // Changed to require
const genres = require('../routes/genreRoutes'); // Changed to require
const login = require('../routes/loginRoutes'); // Changed to require
const users = require('../routes/userRoutes'); // Changed to require
const error = require('../middleware/error'); // Changed to require


const express = require('express'); // Changed to require

module.exports = (app) => { // Changed to module.exports
    app.use(express.json());
    app.use('/api/customers', customer);
    app.use('/api/rentals', rentals);
    app.use('/api/genres', genres);
    app.use('/api/movies', movies);
    app.use('/api/users', users);
    app.use('/api/login', login);
    app.use('/api/returns', returns);
    app.use(error);
};
