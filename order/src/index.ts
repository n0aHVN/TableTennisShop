import {app} from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './NatsWrapper';
import { InventoryUpdatedListener } from './events/listeners/InventoryUpdatedListener';
import { InventoryCreatedListener } from './events/listeners/InventoryCreatedListener';
import { PaymentCreatedListener } from './events/listeners/PaymentCreatedListener';
import { ProductCreatedListener } from './events/listeners/ProductCreatedListener';
import { ProductUpdatedListener } from './events/listeners/ProductUpdatedListener';
import { OrderExpiredCompleteListener } from './events/listeners/OrderExpiredCompleteListener';
import { ImportItemCreatedListener } from './events/listeners/ImportItemCreatedListener';
import { ImportItemUpdatedListener } from './events/listeners/ImportItemUpdatedListener';
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
    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL must be defined");
    }
    if (!process.env.JWT_KEY){
        process.env.JWT_KEY = "secretkey"
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
        new InventoryCreatedListener(natsWrapper.client).listen();
        new InventoryUpdatedListener(natsWrapper.client).listen();
        new OrderExpiredCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();
        new ProductCreatedListener(natsWrapper.client).listen();
        new ProductUpdatedListener(natsWrapper.client).listen();
        new ImportItemCreatedListener(natsWrapper.client).listen();
        new ImportItemUpdatedListener(natsWrapper.client).listen();
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

