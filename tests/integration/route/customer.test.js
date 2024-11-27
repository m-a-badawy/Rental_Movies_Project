const { customerModel } = require('../../../models/customerSchema.js');
const { userModel } = require('../../../models/userSchema.js');
const request = require('supertest');
const mongoose = require('mongoose');
let server;

describe('/api/customers', () => {
  beforeEach(() => {
    server = require('../../../src/app.js');
  });

  afterEach(async () => {
    await server.close();
    await customerModel.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all the customers', async () => {
      await customerModel.collection.insertMany([
        { name: 'customer1', phone: '12345', isGold: true },
        { name: 'customer2', phone: '67890', isGold: false },
      ]);

      const res = await request(server).get('/api/customers');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(customer => customer.name === 'customer1')).toBeTruthy();
      expect(res.body.some(customer => customer.name === 'customer2')).toBeTruthy();
      expect(res.body.some(customer => customer.phone === '12345')).toBeTruthy();
      expect(res.body.some(customer => customer.phone === '67890')).toBeTruthy();
      expect(res.body.some(customer => customer.isGold === true)).toBeTruthy();
      expect(res.body.some(customer => customer.isGold === false)).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return 404 if invalid id is passed', async () => {
      const _id = 1;
      const res = await request(server).get('/api/customers/' + _id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if we do not find the provided ID in the database', async () => {
      const _id = new mongoose.Types.ObjectId();
      const res = await request(server).get('/api/customers/' + _id);

      expect(res.status).toBe(404);
    });

    it('should return a customer if valid id is passed', async () => {
      const customer = await new customerModel({ name: 'customer1', phone: '123456' });
      await customer.save();

      const res = await request(server).get(`/api/customers/${customer._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', customer.name);
    });
  });

  describe('POST /', () => {
    let token;
    let name;
    let isGold;
    let phone;

    const exec = async () => {
      return await request(server)
        .post('/api/customers')
        .set('x-auth-token', token)
        .send({ name, isGold, phone });
    };

    beforeEach(() => {
      token = new userModel({ _id: new mongoose.Types.ObjectId() }).generateAuthToken();
      name = 'customer1';
      isGold = true;
      phone = '123456';
    });

    afterEach(async () => {
      await server.close();
      await customerModel.deleteMany({});
    });

    it('should return 401 if the client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if the customer name is less than 5 characters', async () => {
      name = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the customer name is more than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the customer phone is less than 5 characters', async () => {
      phone = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the customer phone is more than 50 characters', async () => {
      phone = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the customer status not defined', async () => {
      isGold = '';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the customer if it is valid', async () => {
      await exec();

      const customer = await customerModel.find({ name: 'customer1', isGold: true, phone: '123456' });

      expect(customer).not.toBeNull();
    });

    it('should return the customer if it is valid', async () => {
      const res = await exec();

      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining(['_id', 'name', 'isGold', 'phone'])
      );
    });
  });

  describe('PUT /:id', () => {
    let customer;
    let isGold;
    let phone;
    let token;
    let name;
    let _id;

    const exec = async () => {
      return await request(server)
        .put('/api/customers/' + _id)
        .set('x-auth-token', token)
        .send({ name, isGold, phone });
    };

    beforeEach(async () => {
      server = require('../../../src/app.js');

      token = new userModel({ _id: new mongoose.Types.ObjectId() }).generateAuthToken();

      customer = new customerModel({ name: 'customer1', isGold: true, phone: '123456' });
      await customer.save();

      _id = customer._id;
      name = 'updatedName';
      isGold = false;
      phone = '123456789';
    });

    afterEach(async () => {
      await server.close();
      await customerModel.deleteMany({});
    });

    it('should return 401 if the client is not logged in', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if the customer name is less than 5 characters', async () => {
      name = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the customer name is more than 50 characters', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the customer phone is less than 5 characters', async () => {
      phone = '1234';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if the customer phone is more than 50 characters', async () => {
      phone = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 404 if an invalid ID is provided', async () => {
      _id = '';

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should return 404 if no customer with the given ID exists', async () => {
      _id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should update the customer data if we provide a valid ID', async () => {
      const res = await exec();
    
      expect(res.status).toBe(200);
    
      const updatedCustomer = await customerModel.findById(customer._id);
    
      expect(updatedCustomer).not.toBeNull();
      expect(updatedCustomer.name).toBe(name);
      expect(updatedCustomer.isGold).toBe(isGold);
      expect(updatedCustomer.phone).toBe(phone);
    });    

    it('should return the updated customer data if valid data is provided', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', name);
      expect(res.body).toHaveProperty('phone', phone);
      expect(res.body).toHaveProperty('isGold', isGold);
    });
  });

  describe('DELETE /:id', () => {
    let customer;
    let token;
    let _id;

    const exec = async () => {
      return await request(server)
        .delete('/api/customers/' + _id)
        .set('x-auth-token', token)
        .send();
    };

    beforeEach(async () => {
      token = new userModel({ _id: new mongoose.Types.ObjectId(), isAdmin: true }).generateAuthToken();
      customer = new customerModel({ name: 'customer1', isGold: true, phone: '123456' });
      await customer.save();

      _id = customer._id;
      server = require('../../../src/app.js');
    });

    afterEach(async () => {
      await server.close();
      await customerModel.deleteMany({});
    });

    it('should return 401 if no login provided', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 403 if the user is not admin', async () => {
      token = new userModel({ _id: new mongoose.Types.ObjectId(), isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it('should return 404 if no customer with the given ID exists', async () => {
      _id = new mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it('should delete the customer if a valid id is provided', async () => {
      await exec();

      const customerInDb = await customerModel.findById(_id);

      expect(customerInDb).toBeNull();
    });

    it('should return a message indicating successful deletion', async () => {
      const res = await exec();

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });
  });
});
