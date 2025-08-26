import request from 'supertest';
import { app } from '../../app';

it("Get orders base on User Cookie", async ()=>{
    const response = await request(app).get('/api/orders')
    .set('Cookie', await global.signin());

    expect(response.status).toBe(200);
    console.log(response.body);
})

it("Get 1 order base on User Cookie and order id", async ()=>{
    const {orderDoc} = await global.prepareData();
    const response = await request(app).get(`/api/orders/${orderDoc._id}`)
    .set('Cookie', await global.signin());
    expect(response.status).toBe(200);
});