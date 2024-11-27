const {userModel} = require('../../../models/userSchema');
const {genreModel} = require('../../../models/genreSchema');
const request = require('supertest');
const { default: mongoose } = require('mongoose');

describe('auth middleware', () => {
  let token; 

  beforeEach(async() => { 
    token = await new userModel({_id: new mongoose.Types.ObjectId()}).generateAuthToken()
    server = require('../../../src/app.js'); 
  });

  afterEach(async () => { 
    await server.close(); 
    await genreModel.deleteMany({});
  });


  const exec = () => {
    return request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({ name: 'genre1' });
  }

  it('should return 401 if no token is provided', async () => {
    token = ''; 

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid', async () => {
    token = 'a'; 

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 201 if token is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(201);
  });
});