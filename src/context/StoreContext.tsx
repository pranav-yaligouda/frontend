import * as React from "react";
import { getMyStore } from '@/api/storeApi';

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

const StoreContext = React.createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [store, setStore] = React.useState<Store | null>(null);
  const [loading, setLoading] = React.useState(true);

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

  React.useEffect(() => {
    refreshStore();
  }, []);

  return (
    <StoreContext.Provider value={{ store, setStore, refreshStore, loading }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
