import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  throw new Error('VITE_API_URL environment variable is not set. Please configure it in your .env file.');
}
const API = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // If using httpOnly cookies for auth
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('athani_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
