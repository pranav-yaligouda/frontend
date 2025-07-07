import * as React from "react";

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

const HotelContext = React.createContext<HotelContextType | undefined>(undefined);

export const HotelProvider = ({ children }: { children: React.ReactNode }) => {
  const [hotel, setHotel] = React.useState<Hotel | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refreshHotel = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('athani_token');
      if (!token) throw new Error('No token');
      const { getMyHotel } = await import('@/api/hotelApi');
      const data = await getMyHotel(token);
      setHotel(data);
    } catch (err) {
      setHotel(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    refreshHotel();
  }, []);

  return (
    <HotelContext.Provider value={{ hotel, setHotel, refreshHotel, loading }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const ctx = React.useContext(HotelContext);
  if (!ctx) throw new Error('useHotel must be used within HotelProvider');
  return ctx;
};
