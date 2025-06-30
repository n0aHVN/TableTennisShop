import { IInventory, RacketModel } from '@tabletennisshop/common';
import { Types } from 'mongoose';

export const getInventoryData = async (): Promise<IInventory[]> => {
    console.log("Adding inventory data...");
    let racket1, racket2;

    try {
        racket1 = await RacketModel.findOne({name: "Zhang Jike ALC"});
    } catch (error) {
        console.error('Error finding racket1:', error);
        throw new Error('Failed to find racket: Zhang Jike ALC');
    }

    try {
        racket2 = await RacketModel.findOne({name: "Viscaria ALC"});
    } catch (error) {
        console.error('Error finding racket2:', error);
        throw new Error('Failed to find racket: Viscaria ALC');
    }
    const inventoryData: IInventory[] = [
        {
            product_id: racket1!._id as Types.ObjectId,
            total_quantity: 100,
            serials: ["SN001", "SN002", "SN003"]
        },
        {
            product_id: racket2!._id as Types.ObjectId,
            total_quantity: 50,
            serials: ["SN004", "SN005"]
        },
    ];
    return inventoryData;
}
