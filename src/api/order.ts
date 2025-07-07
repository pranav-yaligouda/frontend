import API from './index';
import type { Order } from '../types/order';

import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

let socket: ReturnType<typeof io> | null = null;

/**
 * Service to handle order processing, including store allocation
 * and inventory management
 */
export class OrderProcessingService {
  /**
   * Allocates order items to stores based on availability and proximity
   * @param customerLocation Customer location for distance calculation
   * @param items Items in the cart
   * @returns Allocated items by store
   */
  // All allocation and stock validation is now handled by the backend API.


  /**
   * Calculate the optimized route for an order delivery
   */
  // Delivery route calculation must be performed by the backend. If needed, call an API endpoint for route calculation.

  /**
   * Generate a verification PIN for order pickup
   * @returns 6-digit PIN
   */
  static generateVerificationPin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  /**
   * Verify location proximity for PIN verification
   * @param currentLocation Current GPS location of delivery agent
   * @param storeLocation Store location coordinates
   * @returns Boolean indicating if agent is close enough to store
   */
  static verifyLocationProximity(
    currentLocation: { lat: number; lng: number },
    storeLocation: { lat: number; lng: number }
  ): boolean {
    // Simple Haversine distance calculation
    const R = 6371; // Earth radius in km
    const dLat = (storeLocation.lat - currentLocation.lat) * Math.PI / 180;
    const dLon = (storeLocation.lng - currentLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(storeLocation.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    // Return true if within 100 meters (0.1 km)
    return distance <= 0.1;
  }
  
  /**
   * Process a new order
   * 1. Validate stock availability
   * 2. Allocate items to 
   * 3. Create order
   * 4. Calculate delivery route
   * 5. Update order with route
   */
  static async processOrder(orderData: unknown) {
    try {
      const response = await API.post('/orders', orderData);
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Order processing failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error processing order:', error.message);
      } else {
        console.error('Unknown error processing order:', error);
      }
      // Optionally handle axios error shape here
      // if (axios.isAxiosError(error) && error.response?.data?.error) { ... }
      throw error;
    }
  }
  
  /**
   * Verify order pickup at store
   * @param orderId Order ID to verify
   * @param storeId Store ID where pickup is happening
   * @param pin PIN provided by delivery agent
   * @param location Current location of delivery agent
   * @returns Boolean indicating verification success
   */
  static async verifyOrderPickup(orderId: string, storeId: string, pin: string, location: { lat: number; lng: number }): Promise<boolean> {
    try {
      const response = await API.post(`/orders/${orderId}/pickup`, { storeId, pin, location });
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Order pickup verification failed');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error verifying order pickup:', error.message);
      } else {
        console.error('Unknown error verifying order pickup:', error);
      }
      throw error;
    }
  }

  static async fetchOrdersByRole(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) {
    try {
      const query = new URLSearchParams();
      if (typeof params.page === 'string') query.append('page', params.page);
else if (typeof params.page === 'number') query.append('page', String(params.page));
      if (typeof params.pageSize === 'string') query.append('pageSize', params.pageSize);
else if (typeof params.pageSize === 'number') query.append('pageSize', String(params.pageSize));
      if (params.status && params.status !== 'ALL') query.append('status', params.status);
      if (params.dateFrom) query.append('dateFrom', params.dateFrom);
      if (params.dateTo) query.append('dateTo', params.dateTo);
      // Remove legacy/unsupported params (role, userId)
      const response = await API.get(`/orders?${query.toString()}`);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch orders');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching orders:', error.message);
      } else {
        console.error('Unknown error fetching orders:', error);
      }
      throw error;
    }
  }

  static async fetchAvailableOrdersForAgent(params: {
    page?: number;
    pageSize?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) {
    try {
      const query = new URLSearchParams();
      if (typeof params.page === 'string') query.append('page', params.page);
else if (typeof params.page === 'number') query.append('page', String(params.page));
      if (typeof params.pageSize === 'string') query.append('pageSize', params.pageSize);
else if (typeof params.pageSize === 'number') query.append('pageSize', String(params.pageSize));
      if (params.status) query.append('status', params.status);
      if (params.dateFrom) query.append('dateFrom', params.dateFrom);
      if (params.dateTo) query.append('dateTo', params.dateTo);
      const response = await API.get(`/orders/available/agent?${query.toString()}`);
      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch available orders');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching available orders:', error.message);
      } else {
        console.error('Unknown error fetching available orders:', error);
      }
      throw error;
    }
  }

  static subscribeToOrderUpdates(userId: string, businessId?: string, onUpdate?: (order: Order) => void) {
    if (!socket) {
      socket = io();
    }
    socket.emit('join', userId);
    if (businessId) socket.emit('join', businessId);
    if (onUpdate) {
      socket.on('order:status', onUpdate);
      socket.on('order:new', onUpdate);
    }
  }

  static unsubscribeFromOrderUpdates() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  static async updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await API.patch(`/api/v1/orders/${orderId}/status`, { status });
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to update order status');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating order status:', error.message);
      } else {
        console.error('Unknown error updating order status:', error);
      }
      throw error;
    }
  }

  /**
   * Fetch a single order by ID
   * @param orderId Order ID to fetch
   * @returns Order object
   */
  static async fetchOrderById(orderId: string): Promise<Order> {
    try {
      const response = await API.get(`/orders/${orderId}`);
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch order');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching order:', error.message);
      } else {
        console.error('Unknown error fetching order:', error);
      }
      throw error;
    }
  }
}

export default OrderProcessingService;
