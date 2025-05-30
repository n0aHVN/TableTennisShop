import { ProductEnum } from "../enums/product-enum";
import { IProductBase } from "./product-base";
interface IShirtDetails {
  form: string;
  material: string;
  technology: string;
  size: string;
}
export interface IShirtProduct extends IProductBase {
  type: ProductEnum.Shirt;
  details: IShirtDetails;
}