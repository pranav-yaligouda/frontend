import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) {
  throw new Error('VITE_API_URL environment variable is not set. Please configure it in your .env file.');
}

// Fetch the current user's store (store owner only)
export async function getMyStore() {
  const token = localStorage.getItem('athani_token');
  if (!token) {
    console.warn('[storeApi] No JWT token found in localStorage!');
  }
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };
  console.log('[storeApi] GET /stores/me', { headers });
  const res = await axios.get(`${API_BASE}/stores/me`, { headers, params: { t: Date.now() } });
  console.log('[storeApi] Response:', res.data);
  return res.data;
}

// Update the current user's store (store owner only)
export async function updateMyStore(data: any) {
  const token = localStorage.getItem('athani_token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const res = await axios.put(`${API_BASE}/stores/me`, data, { headers });
  return res.data;
}
