export interface Product {
    _id?: string;
    id?: string; // frontend use
    store: string;
    storeId?: string; // frontend use
    storeName?: string; // frontend use
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
    // Modern card UI/UX fields
    discountPercent?: number;
    isNew?: boolean;
    isBestseller?: boolean;
    rating?: number;
}