import { IVendorPurchase, ProductModel, VendorModel } from "@tabletennisshop/common";
import { Types } from "mongoose";

/**
 * This function generates an array of vendor purchase data.
 * It retrieves specific products and vendors from the database
 * and constructs purchase records with current date, product IDs,
 * prices, quantities, and vendor IDs.
 *
 * @returns {Promise<IVendorPurchase[]>} An array of vendor purchase records.
 */

export const getVendorPurchasedData = async (): Promise<IVendorPurchase[]> => {
    console.log("Adding vendor purchase data...");
    let zjkRacket, fzdRacket, vendor1, vendor2;

    try {
        zjkRacket = await ProductModel.findOne({ name: 'Zhang Jike ALC' });
    } catch (error) {
        console.error('Error finding zjkRacket:', error);
        throw new Error('Failed to find product: Zhang Jike ALC');
    }

    try {
        fzdRacket = await ProductModel.findOne({ name: 'Fan Zhendong ALC' });
    } catch (error) {
        console.error('Error finding fzdRacket:', error);
        throw new Error('Failed to find product: Fan Zhendong ALC');
    }

    try {
        vendor1 = await VendorModel.findOne({ name: 'Vendor 1' });
    } catch (error) {
        console.error('Error finding vendor1:', error);
        throw new Error('Failed to find vendor: Vendor 1');
    }

    try {
        vendor2 = await VendorModel.findOne({ name: 'Vendor 2' });
    } catch (error) {
        console.error('Error finding vendor2:', error);
        throw new Error('Failed to find vendor: Vendor 2');
    }

    return [
        {
            date: new Date(Date.now()),
            products:[{
                    product_id: zjkRacket?._id as Types.ObjectId,
                    price: 3000000,
                    quantity: 10
                }
            ],
            vendor_id: vendor1?._id as Types.ObjectId
        },
        {
            date: new Date(Date.now()),
            products:[{
                    product_id: fzdRacket?._id as Types.ObjectId,
                    price: 3500000,
                    quantity: 5
                }
            ],
            vendor_id: vendor2?._id as Types.ObjectId
        }
    ];
};