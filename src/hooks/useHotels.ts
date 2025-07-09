import { useQuery } from '@tanstack/react-query';
import { getAllHotels } from '@/api/hotelApi';

export function useHotels() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['hotels'],
    queryFn: () => getAllHotels().then(res => {
      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      // Normalize hotels to always have id
      return items.map(hotel => ({
        ...hotel,
        id: hotel._id || hotel.id,
      }));
    }),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  return { data: data || [], isLoading, isError };
} 