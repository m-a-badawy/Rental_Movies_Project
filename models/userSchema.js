const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const Joi = require('joi');

/*
    // observations: don't delete those users from this file cause you will need them while using postman 
    // Admin
    {
        "name" : "Mohamed ali badawy",
        "email" : "mohamed.ali.badawy.pr@gmail.com",
        "password" : "159132"
    }
    
    // normal user
    {
        "name": "Alice Johnson",
        "email": "alice.johnson@example.com",
        "password": "password123"
    },
*/

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    isAdmin: {
        type: Boolean
    }
});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
    return token;
};

const userModel = mongoose.model('User', userSchema);

function userValidation(user) {
    const userSchema = Joi.object({
        name: Joi.string().min(5).max(255).required(),
        email: Joi.string().min(5).max(255).required(),
        password: Joi.string().min(5).max(1024).required(),
        isAdmin: Joi.boolean()
    });

    return userSchema.validate(user);
}

function loginValidation(req) {
    const userValidation = Joi.object({
        email: Joi.string().min(5).max(255).required(),
        password: Joi.string().min(5).max(1024).required()
    });

    return userValidation.validate(req);
}

module.exports = {
    userModel,
    userValidation,
    loginValidation,
};
