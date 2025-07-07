import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

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

// --- Minimal robust global error toast interceptor ---
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Show a user-friendly toast for all API/network errors
    if (error.response?.data?.error) {
      toast({
        title: 'Error',
        description: error.response.data.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Network Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
    // Log errors in development for debugging
    if (import.meta.env.DEV) {
      console.error('[API ERROR]', error);
    }
    return Promise.reject(error);
  }
);

export default API;
