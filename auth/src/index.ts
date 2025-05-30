import mongoose from "mongoose";
import {app} from './app';
const start = async () => {
    try{
        await mongoose.connect("mongodb://mongo-service:27017/");
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
