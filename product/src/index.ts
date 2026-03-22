import {app} from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './NatsWrapper';
import { InventoryCreatedListener } from './events/listeners/InventoryCreatedListener';
import { InventoryUpdatedListener } from './events/listeners/InventoryUpdatedListener';
import { ensureBucket } from './utils/minio';

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

    try{
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL,
        )
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());
        new InventoryCreatedListener(natsWrapper.client).listen();
        new InventoryUpdatedListener(natsWrapper.client).listen();
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

    try {
        await ensureBucket();
        console.log("MinIO bucket ready");
    } catch (e) {
        console.warn("MinIO not available, image uploads will fail:", e);
    }
}

app.listen(3000, 
    ()=>console.log("Listen on port 3000!")
);

start();

