const { movieModel, movieValidation } = require('../models/moviesSchema');
const validationSchema = require('../middleware/validationSchema');
const validateObjectID = require('../middleware/validateObjectID');
const { genreModel } = require('../models/genreSchema');
const Authorization = require('../middleware/auth');
const Admin = require('../middleware/admin');
const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/', async (req, res) => {
    const movies = await movieModel.find().sort('name');
    res.status(200).send(movies);
});

router.get('/:id', validateObjectID , async (req, res) => {
    const movie = await movieModel.findById(req.params.id);
    if (!movie) return res.status(404).send('This movie ID is not available in the database.');
    res.status(200).send(movie);
});

router.post('/', [Authorization ,validationSchema(movieValidation)], async (req, res) => {

    const genre = await genreModel.findById(req.body.genreID);
    if (!genre) return res.status(400).send('This genre is not available.');

    const movie = new movieModel({
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
});

    await movie.save();
    res.status(201).send(movie);
});

router.put('/:id', [Authorization, validateObjectID , validationSchema(movieValidation)] , async (req, res) => {
    
    const genre = await genreModel.findById(req.body.genreID);
    if (!genre) return res.status(400).send('This genre is not available.');

    const movie = await movieModel.findByIdAndUpdate(
        req.params.id,
        {
            ..._.pick(req.body, ['title', 'numberInStock', 'dailyRentalRate']),
            genre: {
                _id: genre._id,
                name: genre.name
            }
        },
        { new: true }
    );

    if (!movie) return res.status(404).send('This movie ID is not available in the database.');
    res.status(200).send(movie);
});

router.delete('/:id',  [Authorization, validateObjectID , Admin], async (req, res) => {
    const movie = await movieModel.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).send('This movie ID is not available in the database.');
    res.status(200).send(movie);
});

module.exports = router;
