import { app } from 'app';
import { MongoMemoryServer } from 'mongodb-memory-server'; // Import in-memory MongoDB server for testing
import mongoose from 'mongoose'; // Import Mongoose for MongoDB object modeling
import request from 'supertest'; // Import Supertest for HTTP assertions

declare global {
  // Add to NodeJS.Global interface
  var signin: () => Promise<string[]>;
}

let mongo: any; // Declare a variable to hold the MongoMemoryServer instance

beforeAll(async () => { // Runs once before all tests
  process.env.JWT_KEY = 'secretkey'; // Set JWT key for authentication
  mongo = new MongoMemoryServer(); // Create a new in-memory MongoDB server
  const mongoUri = await mongo.getUri(); // Get the URI for the in-memory server

  await mongoose.connect(mongoUri);
});

beforeEach(async () => { // Runs before each test
  const collections = await mongoose.connection.db!.collections(); // Get all collections in the DB

  for (let collection of collections) { // For each collection
    await collection.deleteMany({}); // Delete all documents (clean DB)
  }
});

afterAll(async () => { // Runs once after all tests
  await mongo.stop(); // Stop the in-memory MongoDB server
  await mongoose.connection.close(); // Close the Mongoose connection
});


// This function will register a user and return a cookie
global.signin = async () => {
  const email = 'test@test.com'; // Test email
  const password = 'password'; // Test password

  let response = await request(app) // Use Supertest to send a request to the app
    .post('/api/users/signup') // POST to signup endpoint
    .send({
      email,
      password,
    }) // Send email and password in the request body
    .expect(201); // Expect HTTP 201 Created

  response = await request(app)
    .post('/api/users/signin') // POST to signin endpoint
    .send({
      email,
      password,
    })
    .expect(200);

  const cookie = response.get('Set-Cookie')!; // Get the Set-Cookie header from the response
  return cookie; // Return the cookie (for authentication in tests)
};