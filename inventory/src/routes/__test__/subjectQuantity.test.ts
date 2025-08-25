import request from 'supertest';
import {app} from '../../app';

it("add quantity inventory", async () => {
  const id = await global.addInventory();
  const response = await request(app)
    .patch(`/api/inventory/${id}/subject`)
    .set("Cookie", await global.signin())
    .send({
      id: id,
      quantity: 10,
    });

  expect(response.status).toBe(200);
  expect(response.body.data.total_quantity).toBe(90);
  console.log(response.body.data);
});