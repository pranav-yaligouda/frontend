import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1',
  withCredentials: true, // If using httpOnly cookies for auth
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('athani_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
