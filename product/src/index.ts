import {app} from './app';
import mongoose from 'mongoose';
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

app.listen(3000, 
    ()=>console.log("Listen on port 3000!")
);

start();

