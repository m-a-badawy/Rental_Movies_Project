const { movieModel } = require('../../../models/moviesSchema.js');
const { genreModel } = require('../../../models/genreSchema.js');
const { userModel } = require('../../../models/userSchema.js');
const request = require('supertest');
const mongoose = require('mongoose');
let server;

describe('/api/movies', () => {
    beforeEach(() => {
        server = require('../../../src/app.js');
    });

    afterEach(async () => {
        await server.close();
        await movieModel.deleteMany({});
        await genreModel.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all the movies from the database', async () => {
            const genre1 = new genreModel({ name: 'genre1' });
            const genre2 = new genreModel({ name: 'genre2' });
            await genre1.save();
            await genre2.save();

            await movieModel.collection.insertMany([
                { title: 'movie1', genreID: genre1._id, numberInStock: 5, dailyRentalRate: 5 },
                { title: 'movie2', genreID: genre2._id, numberInStock: 10, dailyRentalRate: 1 },
            ]);
            
            const res = await request(server).get('/api/movies');
               
            expect(res.status).toBe(200);
              
            console.log(res.body);
            
            expect(res.body.some(movie => movie.title === 'movie1')).toBeTruthy();
            expect(res.body.some(movie => movie.title === 'movie2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return 200 and a movie if valid ID is passed', async () => {
            const genre = await new genreModel({name : "genre1"})
            genreID = genre._id

            console.log(genre);

            const movie = new movieModel({
                title: 'movie1',
                genreID: genreID,
                numberInStock: 1,
                dailyRentalRate: 4,
            });
            await movie.save();
            console.log(movie);

            const res = await request(server).get('/api/movies/' + movie._id);
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id', movie._id.toHexString());
            expect(res.body).toHaveProperty('title', movie.title);
            expect(res.body).toHaveProperty('genreID', movie.genreID.toHexString());
            expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
        });

        it('should return 404 if invalid ID is passed', async () => {
            const res = await request(server).get('/api/movies/1');

            expect(res.status).toBe(404);
        });

        it('should return 404 if the movie does not exist', async () => {
            const id = new mongoose.Types.ObjectId();
            const res = await request(server).get('/api/movies/' + id);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {
        let token;
        let newTitle;
        let genreID;
        let newNumberInStock;
        let newDailyRentalRate;

        const exec = async () => {
            return await request(server)
                .post('/api/movies')
                .set('x-auth-token', token)
                .send({
                    title: newTitle,
                    genreID,
                    numberInStock: newNumberInStock,
                    dailyRentalRate: newDailyRentalRate,
                });
        };

        beforeEach(async () => {
            token = userModel({ _id: new mongoose.Types.ObjectId() }).generateAuthToken();

            const genre = new genreModel({ name: 'genre1' });
            await genre.save();

            genreID = genre._id;
            newTitle = 'movie1';
            newNumberInStock = 5;
            newDailyRentalRate = 3;
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if movie title is less than 5 characters', async () => {
            newTitle = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if movie title is more than 50 characters', async () => {
            newTitle = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genreID is invalid', async () => {
            genreID = 1;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if numberInStock is missing', async () => {
            newNumberInStock = null;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if dailyRentalRate is missing', async () => {
            newDailyRentalRate = null;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the movie if it is valid', async () => {
            await exec();

            const movie = await movieModel.find({
                 title: newTitle,
                 genreID,
                 numberInStock: newNumberInStock,
                 dailyRentalRate: newDailyRentalRate,
            });

            expect(movie).not.toBeNull();
        });
    });
});
