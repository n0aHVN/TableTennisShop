import { IBaseEntity } from './base.model';

export interface IProduct extends IBaseEntity {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: ProductCategory;
  type: ProductType;
  status: ProductStatus;
  rating?: number;
  reviewCount?: number;
}

export interface IProductFilters {
  search?: string;
  category?: ProductCategory;
  type?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export enum ProductCategory {
  RACKETS = 'rackets',
  BALLS = 'balls',
  TABLES = 'tables',
  SHOES = 'shoes',
  CLOTHING = 'clothing',
  ACCESSORIES = 'accessories'
}

export enum ProductType {
  PROFESSIONAL = 'professional',
  INTERMEDIATE = 'intermediate',
  BEGINNER = 'beginner'
}

export enum ProductStatus {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued'
}
