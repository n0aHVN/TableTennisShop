import { app } from "./app";
import mongoose from "mongoose";

const start = async () => {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Config service: connected to MongoDB");
  } catch (e) {
    console.error(e);
    throw new Error("Cannot connect to MongoDB");
  }
};

app.listen(3000, () => console.log("Config service listening on port 3000"));

start();
