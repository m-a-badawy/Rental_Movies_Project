const { userModel, loginValidation } = require('../models/userSchema');
const validationSchema = require('../middleware/validationSchema');
const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');

/*
    // Admin
    {
        "name" : "Mohamed ali badawy",
        "email" : "mohamed.ali.badawy.pr@gmail.com",
        "password" : "159132"
    }
*/ 

const router = express.Router();

router.post('/', validationSchema(loginValidation) ,async (req, res) => {

    const user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password');

    const passwordValidation = await bcrypt.compare(req.body.password, user.password);
    if (!passwordValidation) return res.status(400).send('Invalid email or password');

    const token = user.generateAuthToken();
    res.status(200).send(token);
});



module.exports = router;
