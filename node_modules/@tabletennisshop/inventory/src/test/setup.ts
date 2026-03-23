import {app} from '../app';
import { MongoMemoryServer } from 'mongodb-memory-server'; // Import in-memory MongoDB server for testing
import mongoose, { Types } from 'mongoose'; // Import Mongoose for MongoDB object modeling
import jwt from 'jsonwebtoken';
import { InventoryService } from '../service/inventory.service';
import { InventoryDoc, InventoryModel } from '../models/inventory.model';
declare global {
  // Add to NodeJS.Global interface
  var signin: () => Promise<string[]>;
  var addInventory: () => Promise<InventoryDoc>;
}

jest.setTimeout(10000); // Set Jest timeout to 10 seconds
jest.mock('../NatsWrapper'); // Mock NATS wrapper for event publishing


let mongo: any; // Declare a variable to hold the MongoMemoryServer instance

beforeAll(async () => { // Runs once before all tests
  process.env.JWT_KEY = 'secretkey'; // Set JWT key for authentication
  mongo = await MongoMemoryServer.create(); // Create a new in-memory MongoDB server
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
global.signin = async (id?: string) => {
  const payload = {
    username: "test",
    email: "test@test.com",
    _id: id || new mongoose.Types.ObjectId().toHexString(),
    roles: ["user"],
  }
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const sessionJSON = JSON.stringify({ jwt: token });

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`express:sess=${base64}`];
};

global.addInventory = async()=>{
  const inventory = InventoryModel.build({product_id: new Types.ObjectId().toHexString(), total_quantity: 100});
  await inventory.save();
  return inventory;
}