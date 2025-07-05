export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  storeId: string;
  storeName: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  deliveryInstructions?: string;
  customerLocation?: { lat: number; lng: number };
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  storeIds?: string[];
  verificationPin?: string;
  storePins?: Record<string, string>;
}
