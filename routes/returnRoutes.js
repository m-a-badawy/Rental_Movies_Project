const {rentalModel, rentalValidation } = require('../models/rentalSchema.js');
const validationSchema = require('../middleware/validationSchema.js');
const {movieModel} = require('../models/moviesSchema.js');
const Authorization = require('../middleware/auth.js');
const express = require('express');
const router = express.Router();

router.post('/', [Authorization , validationSchema(rentalValidation)],async(req,res)=>{
    let rental;
    rental = await rentalModel.lookup(req.body.customerId , req.body.movieId);

    if(!rental) 
        return res.status(404).send('rental not found...');
    if(rental.dateReturned) 
        return res.status(400).send('rental already processed.....');

    rental.return();
    await rental.save();

    await movieModel.updateOne(
        {_id: rental.movie._id}, 
        {$inc : {numberInStock: 1}}
    );

    return res.status(200).send(rental);
});


module.exports = router;