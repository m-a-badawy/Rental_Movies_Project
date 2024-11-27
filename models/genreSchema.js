const mongoose = require('mongoose');
const Joi = require('joi');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    }
});

const genreModel = mongoose.model('Genre', genreSchema);

function genreValidation(genre) {
    const genreSchema = Joi.object({
        name: Joi.string().min(5).max(50).required()
    });
    return genreSchema.validate(genre);
}

module.exports = { genreSchema, genreModel, genreValidation };
