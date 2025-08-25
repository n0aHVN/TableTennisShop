import mongoose from "mongoose";
import {app} from './app';
const start = async () => {
    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL must be defined");
    }

    if (!process.env.JWT_KEY) {
        // app.ts
        throw new Error("JWT_KEY must be defined");
    }

    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to Mongo");
    }
    catch(e){
        console.log(e);
        throw new Error("Cannot Connect to MongoDB");
    }
}
console.clear();
app.listen(3000, () => {
    console.log('Listening on port 3000');
});

start();
