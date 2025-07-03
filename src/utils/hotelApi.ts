// Utility for hotel manager dish APIs
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Fetch a single hotel by id (public info)
export async function getHotelById(hotelId: string) {
  const res = await axios.get(`${API_BASE}/hotels/${hotelId}`);
  return res.data;
}

// Fetch all hotels (with their dishes) for homepage display
export async function getAllHotels() {
  const res = await axios.get(`${API_BASE}/hotels`);
  return res.data;
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
export async function addDish(token: string, formData: FormData) {
  const headers = { Authorization: `Bearer ${token}` };
  const res = await axios.post(`${API_BASE}/dishes`, formData, { headers });
  return res.data;
}

// Fetch the standardized dish catalog for hotel managers
export async function getStandardDishes(token: string) {
  const res = await axios.get(`${API_BASE}/standard-dishes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getMyDishes(token: string) {
  // Returns all dishes for the logged-in hotel manager with new fields
  const res = await axios.get(`${API_BASE}/dishes/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// For customer view: fetch dishes by hotel ID (public)
export async function getDishesByHotelId(hotelId: string) {
  const res = await axios.get(`${API_BASE}/dishes/hotel/${hotelId}`);
  return res.data;
}

export async function getMyHotel(token: string) {
  const res = await axios.get(`${API_BASE}/hotels/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateMyHotel(token: string, data: any) {
  const res = await axios.patch(`${API_BASE}/hotels/me`, data, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return res.data;
}
