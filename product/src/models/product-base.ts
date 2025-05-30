import { ProductEnum } from "../enums/product-enum";

// Discriminated union for product details
export interface IProductBase {
  name: string;
  brand: string;
  blade: string | null;
  description: string;
  type: ProductEnum; // Extend with other types as needed
  inventory: IInventory[];
}