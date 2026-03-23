import request from 'supertest';
import { app } from '../../app';
it("get product base on slug", async ()=>{
    const { productDoc } = await global.prepareData();
    const response = await request(app)
        .get(`/api/products/${productDoc.slug}`)
        .set("Cookie", await global.signin())
        .send()
        .expect(200);
    console.log(response.body);
})