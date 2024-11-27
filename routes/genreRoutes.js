
const { genreModel, genreValidation } = require('../models/genreSchema');
const validationSchema = require('../middleware/validationSchema');
const validateObjectID = require('../middleware/validateObjectID');
const Authorization = require('../middleware/auth');
const Admin = require('../middleware/admin');
const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/',async (req, res) => {
    const genres = await genreModel.find().sort('name');
    res.status(200).send(genres);
});

router.get('/:id', validateObjectID , async (req, res) => {
    const genre = await genreModel.findById(req.params.id);
    if (!genre) return res.status(404).send('This genre ID is not available in the database.');
    res.status(200).send(genre);
});

router.post('/', [Authorization, validationSchema(genreValidation)] , async (req, res) => {

    const genre = new genreModel(_.pick(req.body, ['name']));
    await genre.save();
    res.status(201).send(genre);
});

router.put('/:id', [Authorization, validateObjectID , validationSchema(genreValidation)] , async (req, res) => {

    const genre = await genreModel.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!genre) return res.status(404).send('This genre ID is not available in the database.');
    res.status(200).send(genre);
});

router.delete('/:id', [Authorization, validateObjectID , Admin ], async (req, res) => {
    const genre = await genreModel.findByIdAndDelete(req.params.id);
    if (!genre) return res.status(404).send('This genre ID is not available in the database.');
    res.status(204).send(genre);
});

module.exports = router;
