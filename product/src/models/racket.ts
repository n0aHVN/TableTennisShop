import { ProductEnum } from "../enums/product-enum";
import { IProductBase } from "./product-base";
// Define interfaces for product details based on type
interface IRacketDetails {
  speed_rating: number;
  durability_rating: number;
  composition: string;
  size: string;
  thickness: number;
}

interface IRacketProduct extends IProductBase {
  type: ProductEnum.Racket;
  details: IRacketDetails;
}