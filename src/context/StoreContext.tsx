import * as React from "react";
import { getMyStore } from '@/api/storeApi';
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";

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
  error: string | null;
}

const StoreContext = React.createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [store, setStore] = React.useState<Store | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const { user } = useAuth();
  const location = useLocation();

  const refreshStore = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[StoreContext] Fetching store...');
      const data = await getMyStore();
      console.log('[StoreContext] Store API response:', data);
      setStore(data?.data || null);
      setError(null);
    } catch (err) {
      console.error('[StoreContext] Error fetching store:', err);
      setStore(null);
      setError('Failed to load store data.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Only fetch store if user is store_owner and on store dashboard
    if (
      user?.role === "store_owner" &&
      location.pathname.startsWith("/store-dashboard")
    ) {
      refreshStore();
    } else {
      setStore(null); // Clear store context for other users/pages
      setLoading(false);
    }
  }, [user, location]);

  return (
    <StoreContext.Provider value={{ store, setStore, refreshStore, loading, error }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
