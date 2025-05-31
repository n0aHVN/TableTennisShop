import mongoose from 'mongoose';
import { Client } from './models/client.model';
import { RacketModel } from './models/racket.model';
import { ProductEnum } from './enums/product.enum';
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
        console.log(client);
        

        let racket = RacketModel.build({
            type: ProductEnum.Racket,
            name: "Viscaria ALC",
            brand: "Butterfly",
            description:"This is the description",
            details:{
                speed: "11.8",
                vibration: "10.3",
                weight: "82gr",
                composition: "5 Woods + 2 Arylate Carbon",
                size: "157x150mm",
                thickness: "5.8mm"
            },
            price: 3200000
        });

        await racket.save();
        console.log(racket);
        

        racket = RacketModel.build({
            type: ProductEnum.Racket,
            name: "Zhang Jike ALC",
            brand: "Butterfly",
            description:"This is the description",
            details:{
                speed: "11.8",
                vibration: "10.3",
                weight: "82gr",
                composition: "5 Woods + 2 Arylate Carbon",
                size: "157x150mm",
                thickness: "5.8mm"
            },
            price: 8000000
        });
        await racket.save();
        console.log(racket);
        
    }
    catch(e){
        console.log(e);
    }

}

start();
