import mongoose from 'mongoose';
import { UserAttrs, UserModel, RacketModel, InventoryModel, RatingModel, CartModel, OrderModel, VendorPurchaseModel } from '@tabletennisshop/common';
import { getUserData } from './data/user.data';
import { getProductData } from './data/product.data';
import { getInventoryData } from './data/inventory.data';
import { getRatingData } from './data/rating.data';
import { getCartData } from './data/cart.data';
import { getOrderData } from './data/order.data';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://mongo-service:27017/app');
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}

const start = async () => {
    const users: UserAttrs[] = getUserData();
    for (const user of users) {
        const client = UserModel.build(user);
        await client.save();
        console.log(client);
    }

    const products = getProductData();
    for (const product of products) {
        const client = RacketModel.build(product);
        await client.save();
        console.log(client);
    }

    const inventory = await getInventoryData();
    for (const item of inventory) {
        const client = InventoryModel.build(item);
        await client.save();
        console.log(client);
    }

    const rating = await getRatingData();
    for (const item of rating) {
        const client = RatingModel.build(item);
        await client.save();
        console.log(client);
    }

    const cart = await getCartData();
    for (const item of cart) {
        const client = CartModel.build(item);
        await client.save();
        console.log(client);
    }

    const orders = await getOrderData();
    for (const item of orders) {
        const client = OrderModel.build(item);
        await client.save();
        console.log(client);
    }
}
connectDB().then(() => console.log('Database connected.')).then(start);
