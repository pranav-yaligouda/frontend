import API from './index';

const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) {
  throw new Error('VITE_API_URL environment variable is not set. Please configure it in your .env file.');
}

// Fetch the current user's store (store owner only)
export async function getMyStore() {
  const { data } = await API.get('/stores/me', { params: { t: Date.now() } });
  return data;
}

// Update the current user's store (store owner only)
export async function updateMyStore(data: Record<string, unknown>) {
  const { data: updated } = await API.put('/stores/me', data);
  return updated;
}

// Fetch all stores (optionally with search, pagination)
export async function getAllStores(params?: { search?: string; page?: number; limit?: number }) {
  const { data } = await API.get('/stores', { params });
  return data;
}

