import API from './index';
import { Product } from '../types/product';

// Fetch products for a store, with optional filters
export const getProducts = (params: { storeId: string; category?: string; search?: string; page?: number; limit?: number }) =>
  API.get<{ data: { items: Product[]; total: number } }>('/products', { params });

// Create a new product
export const createProduct = (data: Partial<Product>) =>
  API.post<Product>('/products', data);

// Update an existing product
export const updateProduct = (id: string, data: Partial<Product>) =>
  API.put<Product>(`/products/${id}`, data);

// Delete a product
export const deleteProduct = (id: string) =>
  API.delete(`/products/${id}`);

// Fetch a single product by ID
export const getProductById = (id: string) =>
  API.get<{ data: Product }>(`/products/${id}`)
    .then(res => res.data.data);
