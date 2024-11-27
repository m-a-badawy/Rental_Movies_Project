const { userModel, userValidation } = require('../models/userSchema');
const validationSchema = require('../middleware/validationSchema');
const Authorization = require('../middleware/auth');
const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

router.get('/me', Authorization , async (req, res) => {
    const user = await userModel.findById(req.user._id).select('-password');
    return res.send(user);
});

router.post('/', validationSchema(userValidation) ,async (req, res) => {

    let user = await userModel.findOne({ email: req.body.email });
    if (user) return res.status(400).send('This user is already registered....');

    user = new userModel(_.pick(req.body, ['name', 'email', 'password']));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).status(201).send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;
