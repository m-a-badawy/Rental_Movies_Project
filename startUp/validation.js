const Joi = require('joi');
const joiObjectid = require('joi-objectid')(Joi);

module.exports = () => {
    Joi.objectId = joiObjectid(Joi);
};
