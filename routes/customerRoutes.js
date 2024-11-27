const { customerModel, customerValidation } = require('../models/customerSchema');
const validationSchema = require('../middleware/validationSchema.js');
const validateObjectID = require('../middleware/validateObjectID.js');
const Authorization = require('../middleware/auth');
const Admin = require('../middleware/admin');
const express = require('express');
const _ = require('lodash');

const router = express.Router();

router.get('/', async (req, res) => {
    const customers = await customerModel.find().sort('name');
    res.status(200).send(customers);
});

router.get('/:id', validateObjectID  ,async (req, res) => {
    const customer = await customerModel.findById(req.params.id);
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.status(200).send(customer);
});

router.post('/',  [Authorization, validationSchema(customerValidation)] , async (req, res) => {

    let customer = new customerModel(_.pick(req.body, ['name', 'isGold', 'phone']));
    customer = await customer.save();
    res.status(201).send(customer);
});

router.put('/:id', [Authorization, validateObjectID , validationSchema(customerValidation)] ,async (req, res) => {

    const customer = await customerModel.findByIdAndUpdate(
        req.params.id,
        _.pick(req.body, ['name', 'isGold', 'phone']),
        { new: true }
    );
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.status(200).send(customer);
});

router.delete('/:id', [Authorization, validateObjectID ,Admin], async (req, res) => {
    const customer = await customerModel.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.status(204).send();
});

module.exports = router; // Changed to module.exports
