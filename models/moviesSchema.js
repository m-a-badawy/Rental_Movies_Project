const { genreSchema } = require('../models/genreSchema.js');
const mongoose = require('mongoose');
require('../startUp/validation.js');
const Joi = require('joi');

const movieModel = mongoose.model('Movie', new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 50
  },
  genre: {
    type: genreSchema,
    required: true
  },
  numberInStock: {
    type: Number, 
    required: true,
    min: 0,
    max: 255
  },
  dailyRentalRate: {
    type: Number, 
    required: true,
    min: 0,
    max: 255
  }
}));

function movieValidation(movie) {
  const movieSchema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    genreID: Joi.objectId.required(),
    numberInStock: Joi.number().min(0).max(255),
    dailyRentalRate: Joi.number().min(0).max(255)
  });

  return movieSchema.validate(movie);
}

module.exports = { movieModel, movieValidation };
