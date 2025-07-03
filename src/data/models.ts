// Store model
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  ownerId: string;
  image: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  openingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  categories: string[];
  active: boolean;
}

// Product model
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stockQuantity: number;
  storeId: string;
  unit: string;
  storeName: string;
  discountPercent?: number;
  featured?: boolean;
  barcode?: string;
  sku?: string;
  costPrice?: number;
  lastRestocked?: string;
}

// StoreProduct model (new - for multi-warehouse inventory)
export interface StoreProduct {
  storeId: string;
  productId: string;
  stockQuantity: number;
  lastUpdated: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
}

// Category model
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

// Order model
export interface Order {
  id: string;
  customerId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    storeId: string;
    storeName: string;
  }[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
  updatedAt: string;
  deliveryAddress: string;
  deliveryAgent?: {
    id: string;
    name: string;
    phone: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
  estimatedDeliveryTime?: string;
  storeIds: string[];
  paymentMethod: 'cash' | 'online' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryInstructions?: string;
  verificationPin?: string; // Added verification PIN property
  storePins?: Record<string, string>; // Added store PINs property for multi-store orders
  optimizedRoute?: {
    storePickups: {
      storeId: string;
      storeName: string;
      location: {
        lat: number;
        lng: number;
      };
      items: string[];
    }[];
    customerDropoff: {
      location: {
        lat: number;
        lng: number;
      };
      address: string;
    };
  };
}

// InventoryTransaction model (new)
export interface InventoryTransaction {
  id: string;
  storeId: string;
  productId: string;
  quantity: number; // positive for increase, negative for decrease
  type: 'restock' | 'sale' | 'return' | 'adjustment' | 'transfer';
  referenceId?: string; // order id, transfer id, etc.
  createdAt: string;
  createdBy: string;
  notes?: string;
}

// StoreTransfer model (new)
export interface StoreTransfer {
  id: string;
  fromStoreId: string;
  toStoreId: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  items: {
    productId: string;
    name: string;
    quantity: number;
  }[];
  createdAt: string;
  updatedAt: string;
  initiatedBy: string;
}

// Mock data for stores
export const stores: Store[] = [
  {
    id: 'store1',
    name: 'Fresh Greens Market',
    address: '123 Main St, Athani',
    phone: '9876543210',
    email: 'fresh@example.com',
    ownerId: '2',
    image: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTV8fGdyb2Nlcnl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
    description: 'Your neighborhood grocery store with fresh vegetables and fruits',
    location: {
      lat: 16.7359,
      lng: 75.0689
    },
    openingHours: [
      { day: 'Monday', open: '08:00', close: '20:00' },
      { day: 'Tuesday', open: '08:00', close: '20:00' },
      { day: 'Wednesday', open: '08:00', close: '20:00' },
      { day: 'Thursday', open: '08:00', close: '20:00' },
      { day: 'Friday', open: '08:00', close: '20:00' },
      { day: 'Saturday', open: '08:00', close: '20:00' },
      { day: 'Sunday', open: '08:00', close: '18:00' }
    ],
    categories: ['vegetables', 'fruits', 'dairy'],
    active: true
  },
  {
    id: 'store2',
    name: 'Athani General Store',
    address: '456 Oak St, Athani',
    phone: '9876543211',
    email: 'general@example.com',
    ownerId: '5',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60',
    description: 'Everything you need under one roof',
    location: {
      lat: 16.7289,
      lng: 75.0759
    },
    openingHours: [
      { day: 'Monday', open: '09:00', close: '21:00' },
      { day: 'Tuesday', open: '09:00', close: '21:00' },
      { day: 'Wednesday', open: '09:00', close: '21:00' },
      { day: 'Thursday', open: '09:00', close: '21:00' },
      { day: 'Friday', open: '09:00', close: '21:00' },
      { day: 'Saturday', open: '09:00', close: '21:00' },
      { day: 'Sunday', open: '09:00', close: '19:00' }
    ],
    categories: ['groceries', 'household', 'stationery'],
    active: true
  }
];

// Mock data for categories
export const categories: Category[] = [
  {
    id: 'cat1',
    name: 'Vegetables',
    description: 'Fresh locally sourced vegetables',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 'cat2',
    name: 'Fruits',
    description: 'Seasonal and exotic fruits',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 'cat3',
    name: 'Groceries',
    description: 'Pantry essentials',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80'
  },
  {
    id: 'cat4',
    name: 'Dairy',
    description: 'Milk, cheese, and other dairy products',
    image: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80'
  },
  {
    id: 'cat5',
    name: 'Household',
    description: 'Cleaning and household items',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
  {
    id: 'cat6',
    name: 'Stationery',
    description: 'Books, pens, and office supplies',
    image: 'https://images.unsplash.com/photo-1568934280963-02f342a7a789?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80'
  }
];

// Mock data for products
export const products: Product[] = [
  {
    id: 'prod1',
    name: 'Fresh Tomatoes',
    description: 'Locally grown fresh tomatoes',
    price: 40,
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1592924357229-a32e20c7c1e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
    stockQuantity: 50,
    storeId: 'store1',
    unit: '1 kg',
    storeName: 'Fresh Greens Market',
    featured: true
  },
  {
    id: 'prod2',
    name: 'Potatoes',
    description: 'Fresh farm potatoes',
    price: 30,
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    stockQuantity: 100,
    storeId: 'store1',
    unit: '1 kg',
    storeName: 'Fresh Greens Market'
  },
  {
    id: 'prod3',
    name: 'Onions',
    description: 'Premium quality onions',
    price: 35,
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1620574387735-3624d75b5133?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    stockQuantity: 75,
    storeId: 'store1',
    unit: '1 kg',
    storeName: 'Fresh Greens Market'
  },
  {
    id: 'prod4',
    name: 'Apples',
    description: 'Fresh Kashmiri apples',
    price: 150,
    category: 'fruits',
    image: 'https://images.unsplash.com/photo-1570913196594-40fbcabf4502?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    stockQuantity: 40,
    storeId: 'store1',
    unit: '1 kg',
    discountPercent: 10,
    storeName: 'Fresh Greens Market',
    featured: true
  },
  {
    id: 'prod5',
    name: 'Bananas',
    description: 'Organic bananas',
    price: 60,
    category: 'fruits',
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
    stockQuantity: 60,
    storeId: 'store1',
    unit: '1 dozen',
    storeName: 'Fresh Greens Market'
  },
  {
    id: 'prod6',
    name: 'Milk',
    description: 'Fresh cows milk',
    price: 50,
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
    stockQuantity: 30,
    storeId: 'store1',
    unit: '1 liter',
    storeName: 'Fresh Greens Market',
    featured: true
  },
  {
    id: 'prod7',
    name: 'Fevicol Adhesive',
    description: 'Strong all-purpose adhesive',
    price: 65,
    category: 'household',
    image: 'https://5.imimg.com/data5/SELLER/Default/2020/12/CZ/SI/FS/2256479/fevicol-adhesive-mr-500x500.jpg',
    stockQuantity: 25,
    storeId: 'store2',
    unit: '200g tube',
    storeName: 'Athani General Store'
  },
  {
    id: 'prod8',
    name: 'Scissors',
    description: 'Stainless steel scissors',
    price: 120,
    category: 'household',
    image: 'https://images.unsplash.com/photo-1589839178271-0e3a39cb76e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80',
    stockQuantity: 15,
    storeId: 'store2',
    unit: '1 piece',
    storeName: 'Athani General Store',
    featured: true
  },
  {
    id: 'prod9',
    name: 'Notebook',
    description: 'Ruled notebook for school',
    price: 45,
    category: 'stationery',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    stockQuantity: 100,
    storeId: 'store2',
    unit: '1 piece',
    storeName: 'Athani General Store'
  },
  {
    id: 'prod10',
    name: 'Coriander',
    description: 'Fresh coriander leaves',
    price: 20,
    category: 'vegetables',
    image: 'https://images.unsplash.com/photo-1603736029103-ddd05f0ea2fd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
    stockQuantity: 40,
    storeId: 'store1',
    unit: '100g bunch',
    storeName: 'Fresh Greens Market'
  }
];

// Mock data for orders
export const orders: Order[] = [
  {
    id: 'order1',
    customerId: '1',
    items: [
      {
        productId: 'prod1',
        name: 'Fresh Tomatoes',
        price: 40,
        quantity: 2,
        storeId: 'store1',
        storeName: 'Fresh Greens Market'
      },
      {
        productId: 'prod4',
        name: 'Apples',
        price: 150,
        quantity: 1,
        storeId: 'store1',
        storeName: 'Fresh Greens Market'
      }
    ],
    status: 'delivered',
    total: 230,
    createdAt: '2023-05-15T10:30:00Z',
    updatedAt: '2023-05-15T11:45:00Z',
    deliveryAddress: '789 Park Avenue, Athani',
    storeIds: ['store1'],
    paymentMethod: 'cash',
    paymentStatus: 'completed'
  },
  {
    id: 'order2',
    customerId: '1',
    items: [
      {
        productId: 'prod7',
        name: 'Fevicol Adhesive',
        price: 65,
        quantity: 1,
        storeId: 'store2',
        storeName: 'Athani General Store'
      },
      {
        productId: 'prod9',
        name: 'Notebook',
        price: 45,
        quantity: 3,
        storeId: 'store2',
        storeName: 'Athani General Store'
      }
    ],
    status: 'out_for_delivery',
    total: 200,
    createdAt: '2023-05-16T14:20:00Z',
    updatedAt: '2023-05-16T15:30:00Z',
    deliveryAddress: '789 Park Avenue, Athani',
    deliveryAgent: {
      id: '3',
      name: 'Delivery Agent',
      phone: '9876543212'
    },
    estimatedDeliveryTime: '2023-05-16T16:30:00Z',
    storeIds: ['store2'],
    paymentMethod: 'online',
    paymentStatus: 'completed'
  }
];

// Mock data for store products (new)
export const storeProducts: StoreProduct[] = [
  {
    storeId: 'store1',
    productId: 'prod1',
    stockQuantity: 50,
    lastUpdated: new Date().toISOString(),
    minStockLevel: 10,
    maxStockLevel: 100,
    reorderPoint: 20
  },
  {
    storeId: 'store1',
    productId: 'prod2',
    stockQuantity: 100,
    lastUpdated: new Date().toISOString(),
    minStockLevel: 20,
    maxStockLevel: 150,
    reorderPoint: 30
  },
  {
    storeId: 'store1',
    productId: 'prod3',
    stockQuantity: 75,
    lastUpdated: new Date().toISOString(),
    minStockLevel: 15,
    maxStockLevel: 100,
    reorderPoint: 25
  },
  {
    storeId: 'store2',
    productId: 'prod7',
    stockQuantity: 25,
    lastUpdated: new Date().toISOString(),
    minStockLevel: 5,
    maxStockLevel: 50,
    reorderPoint: 10
  },
  {
    storeId: 'store2',
    productId: 'prod8',
    stockQuantity: 15,
    lastUpdated: new Date().toISOString(),
    minStockLevel: 5,
    maxStockLevel: 30,
    reorderPoint: 8
  },
  {
    storeId: 'store2',
    productId: 'prod9',
    stockQuantity: 100,
    lastUpdated: new Date().toISOString(),
    minStockLevel: 20,
    maxStockLevel: 150,
    reorderPoint: 40
  }
];

// Mock data for inventory transactions (new)
export const inventoryTransactions: InventoryTransaction[] = [
  {
    id: 'invt1',
    storeId: 'store1',
    productId: 'prod1',
    quantity: 50,
    type: 'restock',
    createdAt: '2023-05-10T08:00:00Z',
    createdBy: '2',
    notes: 'Initial stock'
  },
  {
    id: 'invt2',
    storeId: 'store1',
    productId: 'prod1',
    quantity: -2,
    type: 'sale',
    referenceId: 'order1',
    createdAt: '2023-05-15T10:45:00Z',
    createdBy: 'system',
    notes: 'Order #order1'
  }
];

// Mock data functions (simulating API calls)
export const getProductsByCategory = (categoryId: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = products.filter(product => product.category === categoryId);
      resolve(filtered);
    }, 500);
  });
};

export const getProductsByStore = (storeId: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = products.filter(product => product.storeId === storeId);
      resolve(filtered);
    }, 500);
  });
};

export const getFeaturedProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = products.filter(product => product.featured);
      resolve(filtered);
    }, 500);
  });
};

export const getStoreById = (storeId: string): Promise<Store | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const store = stores.find(store => store.id === storeId);
      resolve(store);
    }, 300);
  });
};

export const getOrderById = (orderId: string): Promise<Order | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = orders.find(order => order.id === orderId);
      resolve(order);
    }, 300);
  });
};

export const getProductById = (productId: string): Promise<Product | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find(product => product.id === productId);
      resolve(product);
    }, 300);
  });
};

export const getOrdersByCustomer = (customerId: string): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = orders.filter(order => order.customerId === customerId);
      resolve(filtered);
    }, 500);
  });
};

export const getOrdersByStore = (storeId: string): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = orders.filter(order => order.storeIds.includes(storeId));
      resolve(filtered);
    }, 500);
  });
};

// Get products by availability across stores
export const getAvailableProducts = (productIds: string[]): Promise<Map<string, StoreProduct[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const results = new Map<string, StoreProduct[]>();
      
      productIds.forEach(productId => {
        const availableStoreProducts = storeProducts.filter(sp => 
          sp.productId === productId && sp.stockQuantity > 0
        );
        
        if (availableStoreProducts.length > 0) {
          results.set(productId, availableStoreProducts);
        }
      });
      
      resolve(results);
    }, 500);
  });
};

// Get store products by store
export const getStoreProductsByStore = (storeId: string): Promise<StoreProduct[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = storeProducts.filter(sp => sp.storeId === storeId);
      resolve(filtered);
    }, 300);
  });
};

// Add inventory transaction
export const addInventoryTransaction = (
  transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>
): Promise<InventoryTransaction> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTransaction: InventoryTransaction = {
        ...transaction,
        id: `invt-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      
      inventoryTransactions.push(newTransaction);
      
      // Update stock quantity in the corresponding storeProduct
      const storeProductIndex = storeProducts.findIndex(
        sp => sp.storeId === transaction.storeId && sp.productId === transaction.productId
      );
      
      if (storeProductIndex >= 0) {
        storeProducts[storeProductIndex].stockQuantity += transaction.quantity;
        storeProducts[storeProductIndex].lastUpdated = newTransaction.createdAt;
      } else {
        // If store product doesn't exist yet, create it
        storeProducts.push({
          storeId: transaction.storeId,
          productId: transaction.productId,
          stockQuantity: transaction.quantity,
          lastUpdated: newTransaction.createdAt,
          minStockLevel: 5,
          maxStockLevel: 100,
          reorderPoint: 10
        });
      }
      
      resolve(newTransaction);
    }, 300);
  });
};

// Update stock quantity
export const updateProductStock = (
  productId: string, 
  newQuantity: number
): Promise<Product> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const productIndex = products.findIndex(p => p.id === productId);
      if (productIndex >= 0) {
        products[productIndex].stockQuantity = newQuantity;
        resolve(products[productIndex]);
      } else {
        throw new Error('Product not found');
      }
    }, 300);
  });
};

// Update store product stock
export const updateStoreProductStock = (
  storeId: string,
  productId: string,
  newQuantity: number
): Promise<StoreProduct> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storeProductIndex = storeProducts.findIndex(
        sp => sp.storeId === storeId && sp.productId === productId
      );
      
      if (storeProductIndex >= 0) {
        storeProducts[storeProductIndex].stockQuantity = newQuantity;
        storeProducts[storeProductIndex].lastUpdated = new Date().toISOString();
        resolve(storeProducts[storeProductIndex]);
      } else {
        throw new Error('Store product not found');
      }
    }, 300);
  });
};

// Create store transfer
export const createStoreTransfer = (
  transfer: Omit<StoreTransfer, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<StoreTransfer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newTransfer: StoreTransfer = {
        ...transfer,
        id: `transfer-${Date.now()}`,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      };
      
      // In a real app, this would also create inventory transactions
      // and update stock quantities, but for simplicity, we'll skip that here
      
      resolve(newTransfer);
    }, 300);
  });
};

// Optimized order allocation
export const allocateOrderFromStores = async (
  items: { productId: string, quantity: number }[]
): Promise<{ 
  success: boolean; 
  allocations?: { storeId: string, items: { productId: string, quantity: number }[] }[];
  message?: string;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // 1. Get all product IDs
        const productIds = items.map(item => item.productId);
        
        // 2. Check availability across all stores
        getAvailableProducts(productIds).then(availabilityMap => {
          // 3. Try to allocate from a single store first
          const singleStoreAllocation = trySingleStoreAllocation(items, availabilityMap);
          
          if (singleStoreAllocation) {
            resolve({ 
              success: true, 
              allocations: [singleStoreAllocation] 
            });
            return;
          }
          
          // 4. If single store allocation failed, try multi-store allocation
          const multiStoreAllocation = tryMultiStoreAllocation(items, availabilityMap);
          
          if (multiStoreAllocation && multiStoreAllocation.length > 0) {
            resolve({ 
              success: true, 
              allocations: multiStoreAllocation 
            });
            return;
          }
          
          // 5. If both allocation strategies failed, return failure
          resolve({ 
            success: false,
            message: "Insufficient stock across all stores"
          });
        });
      } catch (error) {
        resolve({ 
          success: false,
          message: `Error allocating order: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }, 500);
  });
};

// Helper function for single store allocation
const trySingleStoreAllocation = (
  items: { productId: string, quantity: number }[],
  availabilityMap: Map<string, StoreProduct[]>
): { storeId: string, items: { productId: string, quantity: number }[] } | null => {
  // Get all store IDs that have at least one of the products
  const storeIds = new Set<string>();
  availabilityMap.forEach(storeProducts => {
    storeProducts.forEach(sp => storeIds.add(sp.storeId));
  });
  
  // For each store, check if it can fulfill the entire order
  for (const storeId of storeIds) {
    const canFulfill = items.every(item => {
      const storeProducts = availabilityMap.get(item.productId) || [];
      const storeProduct = storeProducts.find(sp => sp.storeId === storeId);
      return storeProduct && storeProduct.stockQuantity >= item.quantity;
    });
    
    if (canFulfill) {
      return { 
        storeId, 
        items: items.map(item => ({ productId: item.productId, quantity: item.quantity })) 
      };
    }
  }
  
  return null;
};

// Helper function for multi-store allocation
const tryMultiStoreAllocation = (
  items: { productId: string, quantity: number }[],
  availabilityMap: Map<string, StoreProduct[]>
): { storeId: string, items: { productId: string, quantity: number }[] }[] | null => {
  const allocations: { storeId: string, items: { productId: string, quantity: number }[] }[] = [];
  const remainingItems = [...items];
  
  while (remainingItems.length > 0) {
    const item = remainingItems[0];
    const storeProducts = availabilityMap.get(item.productId) || [];
    
    // Sort store products by stock quantity (descending)
    storeProducts.sort((a, b) => b.stockQuantity - a.stockQuantity);
    
    if (storeProducts.length === 0 || storeProducts[0].stockQuantity === 0) {
      // No stock available anywhere for this item
      return null;
    }
    
    const storeProduct = storeProducts[0];
    const allocatedQuantity = Math.min(item.quantity, storeProduct.stockQuantity);
    
    // Find if there's already an allocation for this store
    let storeAllocation = allocations.find(a => a.storeId === storeProduct.storeId);
    
    if (!storeAllocation) {
      storeAllocation = { storeId: storeProduct.storeId, items: [] };
      allocations.push(storeAllocation);
    }
    
    storeAllocation.items.push({ 
      productId: item.productId, 
      quantity: allocatedQuantity 
    });
    
    // Update remaining quantity
    if (allocatedQuantity < item.quantity) {
      remainingItems[0] = { ...item, quantity: item.quantity - allocatedQuantity };
      
      // Update availability map to reflect allocation
      storeProduct.stockQuantity -= allocatedQuantity;
    } else {
      remainingItems.shift(); // Remove fully allocated item
      
      // Update availability map to reflect allocation
      storeProduct.stockQuantity -= allocatedQuantity;
    }
  }
  
  return allocations;
};

// Create order with multi-warehouse allocation
export const createOrder = (
  order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<Order> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Allocate items from stores
      const orderItems = order.items.map(item => ({ 
        productId: item.productId, 
        quantity: item.quantity 
      }));
      
      const allocation = await allocateOrderFromStores(orderItems);
      
      if (!allocation.success || !allocation.allocations) {
        reject(new Error(allocation.message || "Failed to allocate order"));
        return;
      }
      
      // 2. Create order
      const now = new Date().toISOString();
      const newOrder: Order = {
        ...order,
        id: `order-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        status: 'pending',
        storeIds: [...new Set(allocation.allocations.map(a => a.storeId))]
      };
      
      // 3. Generate optimized route
      if (newOrder.storeIds.length > 0) {
        // Simple route optimization (in real app, use Google Maps Directions API)
        const storePickups = newOrder.storeIds.map(storeId => {
          const store = stores.find(s => s.id === storeId);
          const storeItems = allocation.allocations
            ?.find(a => a.storeId === storeId)?.items
            .map(item => item.productId) || [];
            
          return {
            storeId,
            storeName: store?.name || "Unknown Store",
            location: store?.location || { lat: 0, lng: 0 },
            items: storeItems
          };
        });
        
        newOrder.optimizedRoute = {
          storePickups,
          customerDropoff: {
            location: { lat: 16.7200, lng: 75.0700 }, // Mock location from delivery address
            address: order.deliveryAddress
          }
        };
      }
      
      // 4. Add the order to the mock data
      orders.push(newOrder);
      
      // 5. Update stock quantities (in a real app, this would be a transaction)
      allocation.allocations.forEach(storeAllocation => {
        storeAllocation.items.forEach(item => {
          // Add inventory transaction
          addInventoryTransaction({
            storeId: storeAllocation.storeId,
            productId: item.productId,
            quantity: -item.quantity,
            type: 'sale',
            referenceId: newOrder.id,
            createdBy: 'system',
            notes: `Order #${newOrder.id}`
          });
        });
      });
      
      resolve(newOrder);
    } catch (error) {
      reject(error);
    }
  });
};

export const updateOrderStatus = (
  orderId: string,
  status: Order['status']
): Promise<Order> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex >= 0) {
        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();
        resolve(orders[orderIndex]);
      } else {
        throw new Error('Order not found');
      }
    }, 300);
  });
};

export const searchProducts = (query: string): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      resolve(filtered);
    }, 500);
  });
};

// Get inventory transactions by store
export const getInventoryTransactionsByStore = (
  storeId: string
): Promise<InventoryTransaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = inventoryTransactions.filter(
        transaction => transaction.storeId === storeId
      );
      resolve(filtered);
    }, 300);
  });
};

// Get inventory transactions by product
export const getInventoryTransactionsByProduct = (
  productId: string
): Promise<InventoryTransaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = inventoryTransactions.filter(
        transaction => transaction.productId === productId
      );
      resolve(filtered);
    }, 300);
  });
};

// Get products with low stock
export const getProductsWithLowStock = (storeId: string): Promise<StoreProduct[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = storeProducts.filter(
        sp => sp.storeId === storeId && sp.stockQuantity <= sp.reorderPoint
      );
      resolve(filtered);
    }, 300);
  });
};
