export interface Dish {
  id: string;
  _id?: string;
  name: string;
  price: number;
  image?: string;
  hotelName: string;
  hotelId: string;
  veg?: boolean;
  dietaryTags?: string[];
  category?: string;
  mealType?: string;
  subCategory?: string;
  description?: string;
  standardDishId?: string;
} 