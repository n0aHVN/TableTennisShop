import request from "supertest";
import { app } from "../../app";
import { PaymentModel } from "../../models/payment.model";
import { PaymentStatus } from "@tabletennisshop/common";
import { Types } from "mongoose";
import { natsWrapper } from "../../NatsWrapper";

const setup = async () => {
    // Create a payment in the DB
    const payment = PaymentModel.build({
        order_id: new Types.ObjectId().toHexString(),
        user_id: await global.getUserId(),
        status: PaymentStatus.PENDING,
    });
    await payment.save();

    return { payment };
};

it("completes a payment with valid user and payment id", async () => {
    const { payment } = await setup();
    const response = await request(app)
        .post(`/api/payments/${payment._id.toHexString()}/complete`)
        .set("Cookie", await global.signin())
        .send({});

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(PaymentStatus.COMPLETED);

    const updatedPayment = await PaymentModel.findById(payment._id);
    expect(updatedPayment).toBeDefined();
    expect(updatedPayment!.status).toBe(PaymentStatus.COMPLETED);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("returns 401 if not authenticated", async () => {
    const { payment } = await setup();

    const response = await request(app)
        .post(`/api/payments/${payment._id.toHexString()}/complete`)
        .send();

    expect(response.status).toBe(401);
});

it("returns 401 if payment not found", async () => {
    const fakeId = new Types.ObjectId().toHexString();

    const response = await request(app)
        .post(`/api/payments/${fakeId}/complete`)
        .set("Cookie", await global.signin())
        .send();

    expect(response.status).toBe(401);
});