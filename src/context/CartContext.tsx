
import React, { createContext, useContext, useState, useEffect } from 'react';

// Cart item interface
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  storeId: string;
  storeName: string;
  type: 'product' | 'dish'; // NEW: distinguishes product vs dish
}

// Cart context interface
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getStores: () => { storeId: string; storeName: string }[];
}

// Create cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('athani_cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('athani_cart', JSON.stringify(items));
  }, [items]);

  // Add item to cart
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
  setItems(prevItems => {
    // Fallback for legacy items (before 'type' was added)
    const normalizedItem = {
      ...item,
      type: item.type || (item.storeId && item.productId ? 'product' : 'dish')
    };
    const existingItem = prevItems.find(i => i.id === normalizedItem.id);
    if (existingItem) {
      return prevItems.map(i =>
        i.id === normalizedItem.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      return [...prevItems, { ...normalizedItem, quantity: 1 }];
    }
  });
};

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    setItems(prevItems => 
      quantity > 0 
        ? prevItems.map(item => item.id === id ? { ...item, quantity } : item)
        : prevItems.filter(item => item.id !== id)
    );
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
  };

  // Calculate cart total
  const getTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get total number of items
  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  // Get unique stores in cart
  const getStores = () => {
    const storeMap = new Map<string, string>();
    items.forEach(item => {
      storeMap.set(item.storeId, item.storeName);
    });
    
    return Array.from(storeMap.entries()).map(([storeId, storeName]) => ({ 
      storeId, 
      storeName 
    }));
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
      getStores
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
