const { customerModel } = require('../../../models/customerSchema.js');
const { rentalModel } = require('../../../models/rentalSchema.js');
const { movieModel } = require('../../../models/moviesSchema.js');
const { userModel } = require('../../../models/userSchema.js');
const mongoose = require('mongoose');
const request = require('supertest');
const moment = require('moment');

describe('api/returns', () => {

    let customerId;
    let movieId;
    let server;
    let rental;
    let movie;
    let token;
    let genreId;

    const exec = async () => {
        return await request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    };

    beforeEach(async () => {
        token = new userModel({ _id: new mongoose.Types.ObjectId() }).generateAuthToken();
        server = require('../../../src/app.js');
        customerId = new mongoose.Types.ObjectId();
        movieId = new mongoose.Types.ObjectId();
        genreId = new mongoose.Types.ObjectId();

        movie = new movieModel({
            _id: movieId,
            title: '12345',
            genreID: genreId,
            dailyRentalRate: 2,
            numberInStock: 10
        });
        await movie.save();

        rental = new rentalModel({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345',
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            }
        });

        await rental.save();
    });

    afterEach(async () => {
        await server.close();
        await customerModel.deleteMany({});
        await movieModel.deleteMany({});
        await rentalModel.deleteMany({});
    });

    it('should return 401 if the client is not logged in!', async () => {
        token = '';

        const res = await request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });

        expect(res.status).toBe(401);
    });

    it('should return 400 if the customer ID is not valid', async () => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if the movie ID is not valid', async () => {
        movieId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental matches the given customer ID and movie ID', async () => {
        await rentalModel.deleteMany({});

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('should return 400 if the rental has already been processed', async () => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if the rental is valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('should set the return date if the input is valid', async () => {
        const res = await exec();

        const rentalInDb = await rentalModel.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should calculate the rental fee if the input is valid', async () => {
        rental.dateOut = moment().subtract(7, 'days').toDate();
        await rental.save();

        await exec();

        const rentalInDb = await rentalModel.findById(rental._id);
        expect(rentalInDb.rentalFee).toBe(7 * rental.movie.dailyRentalRate);
    });

    it('should increase the stock of the movie', async () => {
        const initialStock = movie.numberInStock;

        await exec();

        const movieInDb = await movieModel.findById(movieId);
        expect(movieInDb.numberInStock).toBe(initialStock + 1);
    });

    it('should return the rental with the expected keys if the input is valid', async () => {
        const res = await exec();

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining([
                'customer',
                'movie',
                'dateOut',
                'dateReturned',
                'rentalFee'
            ])
        );
    });
});
