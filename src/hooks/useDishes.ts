import { useQuery } from '@tanstack/react-query';
import { getAllDishes } from '@/api/hotelApi';

export function useDishes(params) {
  return useQuery({
    queryKey: ['dishes', params],
    queryFn: async () => {
      const res = await getAllDishes(params);
      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      // Normalize dishes to always have id, hotelId, and hotelName
      return items.map(dish => ({
        ...dish,
        id: dish._id || dish.id,
        hotelId: dish.hotelId,
        hotelName: dish.hotelName, // always present from backend
      }));
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
} 