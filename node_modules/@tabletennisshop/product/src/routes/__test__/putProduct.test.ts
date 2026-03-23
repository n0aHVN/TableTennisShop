import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../NatsWrapper';
it("get product base on slug", async ()=>{
    const { productDoc } = await global.prepareData();
    const response = await request(app)
        .put(`/api/products/${productDoc._id}`)
        .set("Cookie", await global.signin())
        .send({
            _id: productDoc._id.toHexString(),
            version: productDoc.version+1,
            price: 10000,
            sport: "Table Tennis"
        })
        .expect(200);

    expect(response.body.data).toMatchObject({
        _id: productDoc._id.toHexString(),
        version: productDoc.version + 1,
        price: 10000,
        sport: "Table Tennis"
    });
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    console.log(response.body);
})