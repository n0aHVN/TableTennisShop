import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../NatsWrapper';
import { Types } from 'mongoose';
import { InventoryModel } from '../../models/inventory.model';
import { isConstructorDeclaration } from 'typescript';

it("creates a new inventory record with valid data", async () => {
  const product_id = new Types.ObjectId().toHexString();
  
  const response = await request(app)
    .post('/api/inventory')
    .set("Cookie", await global.signin())
    .send({
      product_id,
      total_quantity: 100
    });
    console.log(response.body);
  expect(response.status).toBe(201);
  expect(response.body.data.product_id).toBe(product_id);
  expect(response.body.data.total_quantity).toBe(100);
  
  // Verify it was saved to the database
  const inventory = await InventoryModel.findOne({ product_id });
  expect(inventory).toBeDefined();
  expect(inventory!.total_quantity).toBe(100);
  
  // Check if event was published
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("returns 400 with invalid data - missing product_id", async () => {
  const response = await request(app)
    .post('/api/inventory')
    .set("Cookie", await global.signin())
    .send({
      total_quantity: 100
    });

  expect(response.status).toBe(400);
});

it("returns 400 with invalid data - negative quantity", async () => {
  const response = await request(app)
    .post('/api/inventory')
    .set("Cookie", await global.signin())
    .send({
      product_id: new Types.ObjectId().toHexString(),
      total_quantity: -50
    });

  expect(response.status).toBe(400);
});

it("returns 400 if inventory for product already exists", async () => {
  // First create an inventory
  const product_id = new Types.ObjectId().toHexString();
  await request(app)
    .post('/api/inventory')
    .set("Cookie", await global.signin())
    .send({
      product_id,
      total_quantity: 100
    });
    
  // Try to create another inventory with the same product_id
  const response = await request(app)
    .post('/api/inventory')
    .set("Cookie", await global.signin())
    .send({
      product_id,
      total_quantity: 200
    });

  expect(response.status).toBe(400);
});