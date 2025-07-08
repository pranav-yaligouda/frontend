export interface OrderItem {
  storeId: string;
  productId: string;
  storeName: string;
  type: 'dish' | 'product';
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED_BY_VENDOR'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'ACCEPTED_BY_AGENT'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface Address {
  addressLine: string;
  coordinates: { lat: number; lng: number };
}

export interface Order {
  storePins?: { [storeId: string]: string };
  deliveryInstructions?: string;
  verificationPin?: string;
  optimizedRoute: boolean;
  id: string;
  businessType: 'hotel' | 'store';
  businessId: string;
  items: OrderItem[];
  customerId: string;
  deliveryAgentId?: string;
  status: OrderStatus;
  deliveryAddress: Address;
  pickupAddress: Address;
  paymentMethod: 'cod' | 'online';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  storeIds?: string[];
  paymentStatus?: string;
}
