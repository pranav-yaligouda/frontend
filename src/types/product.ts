export interface Product {
    _id?: string;
    store: string; // storeId as string
    name: string;
    description?: string;
    price: number;
    stock: number;
    image?: string;
    category: string;
    available: boolean;
    unit: 'grams' | 'kg' | 'pieces';
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}