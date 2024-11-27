const { rentalModel, rentalValidation } = require('../models/rentalSchema');
const validateObjectID = require('../middleware/validateObjectID.js');
const validationSchema = require('../middleware/validationSchema.js')
const {customerModel} = require('../models/customerSchema');
const { movieModel } = require('../models/moviesSchema');
const Authorization = require('../middleware/auth');
const express = require('express');

const router = express.Router(); 

router.get('/', async (req, res) => {
    const rentals = await rentalModel.find().sort('-dateOut');
    res.status(200).send(rentals);
});

router.get('/:id', validateObjectID , async (req, res) => {
    const rental = await rentalModel.findById(req.params.id);
    if (!rental) return res.status(404).send('Rental not found.');
    res.status(200).send(rental);
});

router.post('/', [Authorization, validationSchema(rentalValidation)] , async (req, res) => {
  const customer = await customerModel.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Invalid customer.');

  const movie = await movieModel.findOneAndUpdate(
      { _id: req.body.movieId, numberInStock: { $gt: 0 } },
      { $inc: { numberInStock: -1 } },
      { new: true }
  );
  if (!movie) return res.status(400).send('Movie not in stock or invalid movie.');

  const rental = await new rentalModel({ 
    customer: {
      _id: customer._id,
      name: customer.name, 
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  }).save();

  res.send(rental);
});

module.exports = router;