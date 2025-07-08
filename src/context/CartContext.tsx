import * as React from "react";
import { toast } from 'sonner';
import { useState } from 'react';

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
const CartContext = React.createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [pendingItem, setPendingItem] = useState<Omit<CartItem, 'quantity'> | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem('athani_cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem('athani_cart', JSON.stringify(items));
  }, [items]);

  // Add item to cart
  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    // Validate critical fields before adding
    if (!item.id || !item.productId || !item.storeId || item.id === 'undefined_undefined') {
      if (typeof window !== 'undefined' && window.console) {
        window.console.error('Attempted to add invalid cart item:', item);
      }
      toast.error('Cannot add item to cart: Missing or invalid product/store ID.');
      return;
    }
    setItems(prevItems => {
      if (prevItems.length > 0) {
        const first = prevItems[0];
        // Only allow same type and same store/hotel
        if (
          first.type !== item.type ||
          first.storeId !== item.storeId
        ) {
         // Prompt user to clear cart before adding new item
         setPendingItem(item);
         setShowPrompt(true);
         return prevItems; // Do not add yet
        }
      }
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

  // Handler for confirming cart clear and adding new item
  const confirmAndAddPendingItem = () => {
    if (pendingItem) {
      setItems([{ ...pendingItem, quantity: 1 }]);
      setPendingItem(null);
      setShowPrompt(false);
      toast.success('Cart cleared and new item added.');
    }
  };

  // Handler for cancelling cart clear
  const cancelPrompt = () => {
    setPendingItem(null);
    setShowPrompt(false);
    toast.info('Cart not changed.');
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
      {/* Prompt for clearing cart if user tries to add from a different store/hotel/type */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-2">Start a new order?</h2>
            <p className="mb-4">You can only order from one hotel or store at a time. Would you like to clear your cart and add this item?</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={cancelPrompt}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={confirmAndAddPendingItem}>Clear Cart & Add</button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
