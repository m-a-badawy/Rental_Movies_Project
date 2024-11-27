const { userModel } = require('../../../models/userSchema');
const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');
const { iteratee } = require('lodash');

describe('auth middleware', () => {
    
    it('should return res.user if we deal with a valid token' , ()=>{
        const user = { _id: new mongoose.Types.ObjectId().toHexString(), isAdmin: true };
        const token = new userModel(user).generateAuthToken();
        
        const req = {
          header: jest.fn().mockReturnValue(token)
        };
        const res = {};
        const next = jest.fn();
      
        auth(req, res, next);
        expect(req.user).toMatchObject(user);

    })
});