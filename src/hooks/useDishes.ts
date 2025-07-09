import { useQuery } from '@tanstack/react-query';
import { getAllDishes } from '@/api/hotelApi';

export function useDishes(params) {
  return useQuery({
    queryKey: ['dishes', params],
    queryFn: async () => {
      const res = await getAllDishes(params);
      const items = Array.isArray(res.data?.items) ? res.data.items : [];
      // Normalize dishes to always have id and hotelId
      return items.map(dish => ({
        ...dish,
        id: dish._id || dish.id,
        hotelId: dish.hotel || dish.hotelId,
      }));
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
} 