import request from 'supertest';
import { app } from '../../app';
import { OrderStatusEnum, PaymentMethodEnum } from '@tabletennisshop/common';
import { natsWrapper } from '../../NatsWrapper';

it("Updates order status with valid user and order id", async () => {
    const { orderDoc } = await global.prepareData();
    const response = await request(app)
        .patch(`/api/orders/${orderDoc._id.toHexString()}`)
        .set('Cookie', await global.signin())
        .send({ total_price: 99999, payment_method: PaymentMethodEnum.BANKING }); // Use a valid status from your enum

    expect(response.status).toBe(200);
    expect(response.body.data.payment_method).toBe(PaymentMethodEnum.BANKING);
    expect(response.body.data.total_price).toBe(99999);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("Updates order status with valid user and order id", async () => {
    const { orderDoc } = await global.prepareData();
    const response = await request(app)
        .patch(`/api/orders/${orderDoc._id.toHexString()}`)
        .set('Cookie', await global.signin())
        .send({ status: OrderStatusEnum.CANCELLED }); // Use a valid status from your enum

    console.log("NatsWrapper: ",(natsWrapper.client.publish as jest.Mock).mock.calls.map(call => call[0]));
    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(OrderStatusEnum.CANCELLED);
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it("Returns 401 if not authenticated", async () => {
    const { orderDoc } = await global.prepareData();
    const response = await request(app)
        .patch(`/api/orders/${orderDoc._id.toHexString()}`)
        .send({ total_price: 99999, payment_method: PaymentMethodEnum.BANKING });

    expect(response.status).toBe(401);
});

it("Returns 400 for invalid status", async () => {
    const { orderDoc } = await global.prepareData();
    const response = await request(app)
        .patch(`/api/orders/${orderDoc._id.toHexString()}`)
        .set('Cookie', await global.signin())
        .send({ status: "INVALID_STATUS" });

    expect(response.status).toBe(400);
});
