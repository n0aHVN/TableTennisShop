import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../NatsWrapper';

it("updates inventory total_quantity", async () => {
  const inventory = await global.addInventory();
  const response = await request(app)
    .put(`/api/inventory/${inventory._id}`)
    .set("Cookie", await global.signin())
    .send({
      product_id: inventory._id.toHexString(),
      total_quantity: 200
    });

  expect(response.status).toBe(200);
  expect(response.body.data.total_quantity).toBe(200);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  console.log(response.body.data);
});