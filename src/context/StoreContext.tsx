import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMyStore } from '@/utils/storeApi';

export interface Store {
  _id: string;
  name: string;
  address?: string;
  image?: string;
  timings?: { [day: string]: { open: string; close: string; closed: boolean } };
  holidays?: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
}

interface StoreContextType {
  store: Store | null;
  setStore: (store: Store | null) => void;
  refreshStore: () => Promise<void>;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStore = async () => {
    setLoading(true);
    try {
      console.log('[StoreContext] Fetching store...');
      const data = await getMyStore();
      console.log('[StoreContext] Store API response:', data);
      setStore(data?.data || null);
    } catch (err) {
      console.error('[StoreContext] Error fetching store:', err);
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStore();
  }, []);

  return (
    <StoreContext.Provider value={{ store, setStore, refreshStore, loading }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
