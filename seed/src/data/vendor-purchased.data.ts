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
    const zjkRacket = await ProductModel.findOne({ name: 'Zhang Jike ALC' });
    const fzdRacket = await ProductModel.findOne({ name: 'Fan Zhendong ALC' });
    const vendor1 = await VendorModel.findOne({ name: 'Vendor 1' });
    const vendor2 = await VendorModel.findOne({ name: 'Vendor 2' });

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