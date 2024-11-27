const { userModel } = require('../../../../models/userSchema');
const { genreModel } = require('../../../../models/genreSchema');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');

describe('user.generateAuthToken', () => {
    let server;

    beforeEach(()=>{
        server = require('../../../../src/app.js');
    });

    afterEach(async ()=>{
        await server.close();
    });

    it('should generate a valid JWT containing the user ID and isAdmin property', () => {

        const payload = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            isAdmin: true  
        };

        const user = new userModel(payload);
        const token = user.generateAuthToken();
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        expect(decoded).toMatchObject(payload);
    });
});
