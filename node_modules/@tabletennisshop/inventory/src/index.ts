import mongoose from "mongoose";
import { app } from './app';
import { natsWrapper } from "./NatsWrapper";
import { OrderCancelledListener } from "./events/listeners/OrderCancelledListener";
import { OrderCreatedListener } from "./events/listeners/OrderCreatedListener";
import { ProductCreatedListener } from "./events/listeners/ProductCreatedListener";
const start = async () => {
    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL must be defined");
    }

    if (!process.env.JWT_KEY) {
        // app.ts
        throw new Error("JWT_KEY must be defined");
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined');
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined');
    }

    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined');
    }


    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to Mongo");
    }
    catch (e) {
        console.log(e);
        throw new Error("Cannot Connect to MongoDB");
    }

    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID, // tabletennisshop
            process.env.NATS_CLIENT_ID,     // inventory (must be unique, even replicas)
            process.env.NATS_URL).then(() => {  //http://nats-svc:4222
                console.log("Connected to NATS");
            });
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();
        });

        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new OrderCancelledListener(natsWrapper.client).listen();
        new OrderCreatedListener(natsWrapper.client).listen();
        new ProductCreatedListener(natsWrapper.client).listen();
    }
    catch (e) {
        console.log(e);
        throw new Error("Cannot Connect to NATS");
    }
}
console.clear();
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

start();
