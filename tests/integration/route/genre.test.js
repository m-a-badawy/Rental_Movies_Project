const { genreModel } = require('../../../models/genreSchema.js');
const { userModel } = require('../../../models/userSchema.js');
const request = require('supertest');
const mongoose = require('mongoose');
let server;

describe('/api/genres', () => {
    beforeEach(() => {
        server = require('../../../src/app.js');
    });

    afterEach(async () => {
        await server.close();
        await genreModel.deleteMany({});
    });

    describe('GET /', () => {
        it('should return all the genres', async () => {
            await genreModel.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres');
            
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(genre => genre.name === 'genre1')).toBeTruthy();
            expect(res.body.some(genre => genre.name === 'genre2')).toBeTruthy();
        });
    });

    describe('Get/:id' , ()=>{
        it('should return a genre if valid id is passed', async()=>{
            const genre = await new genreModel({name: 'genre1'});
            await genre.save();

            const res = await request(server).get('/api/genres/' + genre._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('_id', genre._id.toHexString());
            expect(res.body).toHaveProperty('name', genre.name);
        });
        it('should return 404 if invalid id is passed', async()=>{
            const _id = 1;
            const res = await request(server).get('/api/genres/' + _id);

            expect(res.status).toBe(404);
        })

        it('should return 404 if we do not find the provided ID in the database', async()=>{
          const _id = new mongoose.Types.ObjectId();
          const res = await request(server).get('/api/genres/' + _id);

          expect(res.status).toBe(404);
        })
    });

    describe('POST /', () => {
        let token; 
        let name; 
    
        const exec = async () => {
          return await request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name });
        }

        beforeEach(() => {
          token = userModel({_id: new mongoose.Types.ObjectId()}).generateAuthToken();      
          name = 'genre1'; 
        })

        
        afterEach(async()=>{
          await server.close();
          await genreModel.deleteMany({});
        });
    
        it('should return 401 if client is not logged in', async () => {
          token = ''; 
    
          const res = await exec();
    
          expect(res.status).toBe(401);
        });
    
        it('should return 400 if genre is less than 5 characters', async () => {
          name = '1234'; 
          
          const res = await exec();
    
          expect(res.status).toBe(400);
        });
    
        it('should return 400 if genre is more than 50 characters', async () => {
          name = new Array(52).join('a');
    
          const res = await exec();
    
          expect(res.status).toBe(400);
        });
    
        it('should save the genre if it is valid', async () => {
          await exec();
    
          const genre = await genreModel.find({ name: 'genre1' });
    
          expect(genre).not.toBeNull();
        });
    
        it('should return the genre if it is valid', async () => {
          const res = await exec();
    
          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('name', 'genre1');
        });
      });

      describe('Put /', ()=>{
        let token;
        let newName;
        let genre;
        let _id;

        const exec = async()=>{
          return await request(server)
            .put('/api/genres/' + _id)
            .set('x-auth-token', token)
            .send({ name : newName });
        };

        beforeEach(async()=>{
          token = await new userModel({_id: new mongoose.Types.ObjectId()}).generateAuthToken(); 
          
          genre = await new genreModel({name: 'genre1'});
          await genre.save();

          _id = genre._id;
          newName = 'updateName';

          server = require('../../../src/app.js');
        });

        afterEach(async()=>{
          await server.close();
          await genreModel.deleteMany({});
        });

        it('should return 401 if client is not logged in', async()=>{
            token = '';

            const res = await exec()

            expect(res.status).toBe(401);
        })

        it('should return 400 if name is less than 5 character', async()=>{
          newName = '1234'

          const res = await exec()

          expect(res.status).toBe(400);
        });

        it('should return 400 if name is more than 50 character', async()=>{
          newName = new Array(52).join('a');

          const res = await exec()

          expect(res.status).toBe(400);
        });

        it('should return 404 if numberInStock of a movie is invalid', async()=>{
          _id = '';

          const res = await exec();

          expect(res.status).toBe(404);
        });

        it('should return 404 if we do not find the provided ID in the database', async()=>{
          _id = new mongoose.Types.ObjectId();

          const res = await exec();

          expect(res.status).toBe(404);
        });

        it('should update the genre name if we provide a valid ID', async()=>{

          await exec();

          const updateGenreName = await genreModel.findById(genre._id);
          expect(updateGenreName.name).toBe(newName);
        });

        
        it('should return 200 if if we updated the genre', async()=>{

          const res = await exec();

          expect(res.body).toHaveProperty('_id');
          expect(res.body).toHaveProperty('name' , newName);
        });
      });

      describe('Delete / ' , ()=>{
        let token;
        let genre;
        let _id;

        const exec = async()=>{
          return await request(server)
            .delete('/api/genres/' + _id)
            .set('x-auth-token', token)
            .send();
        };

        beforeEach( async()=>{
          token = await new userModel({_id: new mongoose.Types.ObjectId(), isAdmin: true}).generateAuthToken();
          genre = await new genreModel({name: 'genre1'});
          await genre.save();

          _id = genre._id;
          server = require('../../../src/app.js');
        });

        afterEach(async ()=>{
          await server.close();
          await genreModel.deleteMany({});
        });

        it('should return 401 if no logging provided', async()=>{
          token = '';

          const res = await exec();

          expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not admin', async()=>{
          token = new userModel({_id: new mongoose.Types.ObjectId() , isAdmin: false}).generateAuthToken();
          const res = await exec();
          expect(res.status).toBe(403);
        });

        it('should return 404 if we provide an invalid ID', async()=>{
          _id = '';

          const res = await exec();

          expect(res.status).toBe(404);
        });
        
        it('should return 404 if we do not find the provided ID in the database', async()=>{
          _id = new mongoose.Types.ObjectId();

          const res = await exec();

          expect(res.status).toBe(404);
        });

        it('should Delete the genre if we have a valid ID', async()=>{
          
          await exec();
          const deleteGenre = await genreModel.findById(_id);
          expect(deleteGenre).toBeNull();
        });

        it('should return 204 and the genre if we have a valid ID', async()=>{

          const  res = await exec();

          expect(res.status).toBe(204);    
          expect(res.body).toEqual({});
        });

      });
});