import request from 'supertest';
import { app } from '../../app';
import { OrderStatusEnum, PaymentMethodEnum } from '@tabletennisshop/common';
import { OrderAttrs } from '../../models/order.model';
import { Types } from 'mongoose';

const setup = async () => {
    const order : Omit<OrderAttrs, 'user_id'> = {
        payment_method: PaymentMethodEnum.BANKING,
        products: [
            {
                product_id: new Types.ObjectId().toHexString(),
                quantity: 2,
                price: 100
            }
        ],
        status: OrderStatusEnum.PENDING,
        total_price: 999,
        expiresAt: new Date(Date.now() + 1000 * 60) // 1 minute from now
    }

    const invalidOrder = {
        payment_method: "INVALID",
        products: [
            {
                product_id: new Types.ObjectId().toHexString(),
                quantity: 2,
                price: 100
            }
        ],
        status: "INVALID",
        total_price: 999,
    }

    return {order, invalidOrder}
};

it("creates an order with valid data and authentication", async () => {

    const { order } = await setup();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', await global.signin())
        .send(order);

    expect(response.status).toBe(201);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.total_price).toBe(order.total_price);
    expect(response.body.data.payment_method).toBe(order.payment_method);
});

it("returns 401 if not authenticated", async () => {
    const { order } = await setup();
    const response = await request(app)
        .post('/api/orders')
        .send(order);

    expect(response.status).toBe(401);
});

it("returns 400 for invalid orders", async () => {
    const { order, invalidOrder } = await setup();
    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', await global.signin())
        .send(invalidOrder);

    expect(response.status).toBe(400);
});