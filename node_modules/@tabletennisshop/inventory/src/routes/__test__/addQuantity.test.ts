import request from 'supertest'
import {app} from '../../app';
import { natsWrapper } from '../../NatsWrapper';
it("add quantity inventory", async () => {
  const inventory = await global.addInventory();
  const response = await request(app)
    .patch(`/api/inventory/${inventory._id.toHexString()}/add`)
    .set("Cookie", await global.signin())
    .send({
      product_id: inventory._id.toHexString(),
      quantity: 10,
    });

  expect(response.status).toBe(200);
  expect(response.body.data.total_quantity).toBe(110);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  console.log(response.body.data);
});