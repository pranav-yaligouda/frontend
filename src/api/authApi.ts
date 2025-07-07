// Centralized Auth API utility for login and registration
// Uses fetch, handles errors and response parsing

import API from './index';

export interface RegisterPayload {
  name: string;
  phone: string;
  password: string;
  role: string;
  email?: string;
  storeName?: string;
  hotelName?: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Record<string, unknown>;
}

// For Vite: use import.meta.env.VITE_API_URL
// For CRA: use process.env.REACT_APP_API_URL (only at build time)
// For now, fallback to hardcoded local API
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:4000/api/v1";

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await API.post('/auth/register', payload);
  return data;
}

export async function login({ phone, password }: { phone: string; password: string }) {
  const { data } = await API.post('/auth/login', { phone, password });
  if (!data.success || !data.data?.user || !data.data?.token) {
    throw new Error(data.error || 'Login failed');
  }
  return { user: data.data.user, token: data.data.token };
}
