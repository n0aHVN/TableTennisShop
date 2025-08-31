import {app} from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './NatsWrapper';
import { OrderCreatedListener } from './events/listeners/OrderCreatedListener';
import { OrderCancelledListener } from './events/listeners/OrderCancelledListener';
import { OrderUpdatedListener } from './events/listeners/OrderUpdatedListener';
const start = async () => {
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error("NATS_CLUSTER_ID must be defined");
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error("NATS_CLIENT_ID must be defined");
    }
    if (!process.env.NATS_URL) {
        throw new Error("NATS_URL must be defined");
    }
    if (!process.env.JWT_KEY){
        process.env.JWT_KEY = "secretkey"
    }
    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL must be defined");
    }
    try{
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        )
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());
        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();
        new OrderUpdatedListener(natsWrapper.client).listen();
    }
    catch (err) {
        console.error(err);
        throw new Error("Cannot connect to NATS");
    }
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    }catch(e){
        console.log(e);
        throw new Error("Cannot Connect to MongoDB");
    }
}

app.listen(3000, 
    ()=>console.log("Listen on port 3000!")
);

start();

