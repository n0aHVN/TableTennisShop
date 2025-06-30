import mongoose from 'mongoose';
import { UserAttrs, UserModel, VendorModel, VendorAttrs, RacketModel, InventoryModel, RatingModel, CartModel, OrderModel, VendorPurchaseModel } from '@tabletennisshop/common';
import { getUserData } from './data/user.data';
import { getVendorData } from './data/vendor.data';
import { getProductData } from './data/product.data';
import { getInventoryData } from './data/inventory.data';
import { getRatingData } from './data/rating.data';
import { getCartData } from './data/cart.data';
import { getOrderData } from './data/order.data';
import { getVendorPurchasedData } from './data/vendor-purchased.data';

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

    const vendors: VendorAttrs[] = getVendorData();
    for (const vendor of vendors) {
        const client = VendorModel.build(vendor);
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

    const vendorPurchase = await getVendorPurchasedData();
    for (const item of vendorPurchase) {
        const client = VendorPurchaseModel.build(item);
        await client.save();
        console.log(client);
    }
    console.log('Data seeding completed successfully!');
}
connectDB().then(() => console.log('Database connected.')).then(start);
