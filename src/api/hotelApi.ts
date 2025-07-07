// Utility for hotel manager dish APIs
import API from './index';

const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) {
  throw new Error('VITE_API_URL environment variable is not set. Please configure it in your .env file.');
}

// Fetch a single hotel by id (public info)
export async function getHotelById(hotelId: string) {
  const { data } = await API.get(`/hotels/${hotelId}`);
  return data;
}

// Fetch all hotels (with their dishes) for homepage display
export async function getAllHotels() {
  const { data } = await API.get('/hotels');
  return data;
}

export interface DishPayload {
  name: string;
  mealType: string;
  cuisineType: string;
  category: string;
  dishName: string;
  dietaryTags: string[];
  price: number;
  description?: string;
  image?: string;
} // New categorization structure

// Accepts FormData for dish creation (required for image/file upload)
export async function addDish(formData: FormData) {
  const { data } = await API.post('/dishes', formData);
  return data;
}

// Fetch all dishes (public, paginated, filterable)
export async function getAllDishes(params: {
  page?: number;
  limit?: number;
  hotelId?: string;
  category?: string;
  mealType?: string;
  cuisineType?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', String(params.page));
  if (params.limit) searchParams.append('limit', String(params.limit));
  if (params.hotelId) searchParams.append('hotelId', params.hotelId);
  if (params.category) searchParams.append('category', params.category);
  if (params.mealType) searchParams.append('mealType', params.mealType);
  if (params.cuisineType) searchParams.append('cuisineType', params.cuisineType);
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  const { data } = await API.get(`/dishes${query}`);
  return data;
}

export async function getMyDishes() {
  const { data } = await API.get('/dishes/mine');
  return data;
}

// For customer view: fetch dishes by hotel ID (public)
export async function getDishesByHotelId(hotelId: string) {
  const { data } = await API.get(`/dishes/hotel/${hotelId}`);
  return data;
}

export async function getMyHotel() {
  const { data } = await API.get('/hotels/me');
  return data;
}

export async function updateMyHotel(data: Record<string, unknown>) {
  const { data: updated } = await API.patch('/hotels/me', data);
  return updated;
}
