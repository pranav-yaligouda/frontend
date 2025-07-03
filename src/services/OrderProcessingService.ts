
import { 
  Order, 
  Product, 
  Store, 
  StoreProduct, 
  createOrder, 
  updateOrderStatus, 
  getStoreProductsByStore,
  getStoreById,
  orders,
  products,
  stores
} from "@/data/models";

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
  static async allocateOrderItems(
    customerLocation: { lat: number; lng: number },
    items: { productId: string; quantity: number }[]
  ) {
    try {
      // In a real backend implementation, this would query the database
      // for all stores with available inventory and calculate distances
      
      // For each product, find stores that have enough stock
      const allocations = await Promise.all(
        items.map(async (item) => {
          // Get product details directly from products array instead of using getProductById
          const product = products.find(p => p.id === item.productId);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          
          // Get all stores that carry this product with enough stock
          const availableStores = await this.findAvailableStores(item.productId, item.quantity);
          
          // Sort stores by proximity to customer
          const sortedStores = this.sortStoresByProximity(availableStores, customerLocation);
          
          if (sortedStores.length === 0) {
            throw new Error(`Not enough stock available for: ${product.name}`);
          }
          
          // Allocate to nearest store
          return {
            productId: item.productId,
            quantity: item.quantity,
            storeId: sortedStores[0].storeId,
            storeName: sortedStores[0].storeName
          };
        })
      );
      
      // Group allocations by store
      const storeAllocations = this.groupAllocationsByStore(allocations);
      
      return storeAllocations;
    } catch (error) {
      console.error("Error allocating order items:", error);
      throw error;
    }
  }
  
  /**
   * Find stores that have enough stock for a product
   */
  private static async findAvailableStores(productId: string, quantity: number) {
    // In a real implementation, this would be a database query
    // SELECT sp.storeId, s.name, sp.stockQuantity 
    // FROM StoreProducts sp 
    // JOIN Stores s ON sp.storeId = s.id
    // WHERE sp.productId = ? AND sp.stockQuantity >= ?
    
    // Mock implementation
    const availableStores: Array<{
      storeId: string;
      storeName: string;
      stockQuantity: number;
    }> = [];
    
    // Get all stores
    const stores = [
      { id: 'store1', name: 'Fresh Greens Market' },
      { id: 'store2', name: 'Athani General Store' },
    ];
    
    for (const store of stores) {
      const storeProducts = await getStoreProductsByStore(store.id);
      const productInStore = storeProducts.find(sp => sp.productId === productId);
      
      if (productInStore && productInStore.stockQuantity >= quantity) {
        availableStores.push({
          storeId: store.id,
          storeName: store.name,
          stockQuantity: productInStore.stockQuantity
        });
      }
    }
    
    return availableStores;
  }
  
  /**
   * Sort stores by proximity to customer
   */
  private static sortStoresByProximity(
    stores: Array<{ storeId: string; storeName: string }>,
    customerLocation: { lat: number; lng: number }
  ) {
    // In a real implementation, this would calculate actual distances
    // using Google Maps Distance Matrix API or similar
    
    // Mock implementation - just return stores in original order
    return stores;
  }
  
  /**
   * Group allocations by store for order processing
   */
  private static groupAllocationsByStore(allocations: Array<{
    productId: string;
    quantity: number;
    storeId: string;
    storeName: string;
  }>) {
    const storeMap = new Map<string, {
      storeId: string;
      storeName: string;
      items: Array<{ productId: string; quantity: number }>;
    }>();
    
    for (const allocation of allocations) {
      if (!storeMap.has(allocation.storeId)) {
        storeMap.set(allocation.storeId, {
          storeId: allocation.storeId,
          storeName: allocation.storeName,
          items: []
        });
      }
      
      storeMap.get(allocation.storeId)?.items.push({
        productId: allocation.productId,
        quantity: allocation.quantity
      });
    }
    
    return Array.from(storeMap.values());
  }
  
  /**
   * Calculate the optimized route for an order delivery
   */
  static async calculateDeliveryRoute(order: Order) {
    // Group items by store
    const storeItems = new Map<string, Array<string>>();
    
    for (const item of order.items) {
      if (!storeItems.has(item.storeId)) {
        storeItems.set(item.storeId, []);
      }
      storeItems.get(item.storeId)?.push(item.productId);
    }
    
    // Create store pickup points
    const storePickups = [];
    for (const [storeId, items] of storeItems.entries()) {
      // Get store details directly from stores array
      const store = stores.find(s => s.id === storeId);
      if (store) {
        storePickups.push({
          storeId,
          storeName: store.name,
          location: store.location,
          items
        });
      }
    }
    
    // Create optimized route
    // In a real implementation, this would use a routing algorithm
    // to determine the optimal order of stores to visit
    
    return {
      storePickups,
      customerDropoff: {
        location: { lat: 16.7200, lng: 75.0700 }, // In a real app, this would be the customer's address geocoded
        address: order.deliveryAddress
      }
    };
  }
  
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
   * 2. Allocate items to stores
   * 3. Create order
   * 4. Calculate delivery route
   * 5. Update order with route
   */
  static async processOrder(orderData: {
    customerId: string;
    items: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
      storeId: string;
      storeName: string;
    }>;
    total: number;
    deliveryAddress: string;
    deliveryInstructions?: string;
    customerLocation?: { lat: number; lng: number };
  }) {
    try {
      // Generate verification PINs for each store in this order
      const storeIds = [...new Set(orderData.items.map(item => item.storeId))];
      const storePins = storeIds.reduce((acc, storeId) => {
        acc[storeId] = this.generateVerificationPin();
        return acc;
      }, {} as Record<string, string>);
      
      // Create the order with verification PIN
      const orderId = await createOrder({
        customerId: orderData.customerId,
        items: orderData.items,
        total: orderData.total,
        deliveryAddress: orderData.deliveryAddress,
        deliveryInstructions: orderData.deliveryInstructions,
        storeIds: storeIds,
        paymentMethod: "cash",
        paymentStatus: "pending",
        verificationPin: Object.values(storePins)[0], // Use first store's PIN as main PIN
        storePins: storePins
      });
      
      // Get the created order directly from orders array
      const order = orders.find(o => String(o.id) === String(orderId));
      
      if (!order) {
        throw new Error("Failed to create order");
      }
      
      // Calculate delivery route
      const optimizedRoute = await this.calculateDeliveryRoute(order);
      
      // In a real implementation, the order would be updated with the route
      // and the stores would be notified
      
      return {
        order,
        optimizedRoute
      };
    } catch (error) {
      console.error("Error processing order:", error);
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
  static async verifyOrderPickup(
    orderId: string, 
    storeId: string, 
    pin: string,
    location: { lat: number; lng: number }
  ): Promise<boolean> {
    // Find the order
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }
    
    // Check if store is part of this order
    if (!order.storeIds.includes(storeId)) {
      throw new Error("Store not part of this order");
    }
    
    // Find the store location
    const store = stores.find(s => s.id === storeId);
    
    if (!store) {
      throw new Error("Store not found");
    }
    
    // Verify PIN
    const isCorrectPin = order.storePins && order.storePins[storeId] === pin;
    
    // Verify location proximity
    const isNearStore = this.verifyLocationProximity(location, store.location);
    
    return isCorrectPin && isNearStore;
  }
}

export default OrderProcessingService;
