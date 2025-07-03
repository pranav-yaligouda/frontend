// Centralized Auth API utility for login and registration
// Uses fetch, handles errors and response parsing

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
  user: any;
}

// For Vite: use import.meta.env.VITE_API_URL
// For CRA: use process.env.REACT_APP_API_URL (only at build time)
// For now, fallback to hardcoded local API
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:4000/api/v1";

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    // Show Zod errors (array of messages)
    if (error.error && Array.isArray(error.error)) {
      throw new Error(error.error.map((e: any) => e.message).join(", "));
    }
    // Show Mongo duplicate key error
    if (error.error && typeof error.error === 'string' && error.error.includes('E11000')) {
      throw new Error('A user with this phone or email already exists.');
    }
    throw new Error(error.error || error.message || "Registration failed");
  }
  return res.json();
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Login failed");
  }
  return res.json();
}
