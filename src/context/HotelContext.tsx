import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMyHotel } from '@/utils/hotelApi';

export interface Hotel {
  _id: string;
  name: string;
  image?: string;
  timings?: { [day: string]: { open: string; close: string; holiday: boolean } };
  holidays?: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
}

interface HotelContextType {
  hotel: Hotel | null;
  setHotel: (hotel: Hotel | null) => void;
  refreshHotel: () => Promise<void>;
  loading: boolean;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider = ({ children }: { children: ReactNode }) => {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshHotel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('athani_token');
      if (!token) throw new Error('No token');
      const data = await getMyHotel(token);
      setHotel(data);
    } catch (err) {
      setHotel(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshHotel();
  }, []);

  return (
    <HotelContext.Provider value={{ hotel, setHotel, refreshHotel, loading }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
};
