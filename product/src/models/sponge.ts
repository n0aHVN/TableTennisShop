import { ProductEnum } from "../enums/product-enum";
import { IProductBase } from "./product-base";

interface ISpongeDetails{
    speed_rating: number,
    spin_rating: number,
    control_rating: number,
    hardness: number,
    thickness: number
}
export interface ISpongeProduct extends IProductBase{
    type: ProductEnum.Sponge,
    details: ISpongeDetails;
}