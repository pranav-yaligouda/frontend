export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stockQuantity: number;
    storeId: string;
    unit: string;
    storeName: string;
    discountPercent?: number;
    featured?: boolean;
    barcode?: string;
    sku?: string;
    costPrice?: number;
    lastRestocked?: string;
  }