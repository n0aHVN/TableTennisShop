import mongoose from 'mongoose';
import { Client } from './models/ClientModel';
const start = async () => {
    try{
        await mongoose.connect("mongodb://mongo-service:27017/");
        console.log("Connected to Mongo");
    }
    catch(e){
        console.log(e);
        throw new Error("Cannot Connect to MongoDB");
    }
    try{
        const client = new Client({
        email: "superherodung123@gmail.com",
        password: "tridung123",
        full_name: "Nguyen Tri Dung",
        address: "address1",
        province: "province1",
        district: "district1",
        ward: "ward1",
        phone_number: "0123456789"
    });
        await client.save();
    }
    catch(e){
        console.log(e);
    }

    try{

    }
    catch(e){
    }

    try{

    }
    catch(e){
    }

    try{

    }
    catch(e){
    }
}

start();
