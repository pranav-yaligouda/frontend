import { DISH_CATEGORIES, MEAL_TYPE_IMAGES } from "@/constants/dishCategorization";

// Map for meal type images (customize as needed)
// const MEAL_TYPE_IMAGES: Record<string, string> = {
//   Breakfast: "/images/categories/dosa.jpg",
//   "Lunch / Dinner / Main Course": "/images/categories/north_indian_thali.jpg",
//   "Snacks & Appetizers": "/images/categories/burger.jpg",
//   "Indo-Chinese Specials": "/images/categories/noodles.jpg",
//   "Breads & Accompaniments": "/images/categories/breads_rice.jpg",
//   Desserts: "/images/categories/dessert.jpg",
//   Beverages: "/images/categories/beverage.jpg",
// };

import * as React from "react";
import type { Dish } from "@/types/dish";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useDishes } from '@/hooks/useDishes';
import { ShoppingCart, Minus, Plus } from 'lucide-react';


interface WhatsOnYourMindSectionProps {
  onCategorySelect?: (catKey: string) => void;
  selectedCategory?: string;
  dishes: Dish[];
  isLoading: boolean;
  onAddToCart?: (dish: Dish) => void;
  onRemoveFromCart?: (dish: Dish) => void;
  hotels: { id: string; name: string }[];
}

const DEFAULT_DISH_IMAGE = "/images/dishes/default.jpg";

// Helper to chunk array into groups of 2
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const WhatsOnYourMindSection: React.FC<WhatsOnYourMindSectionProps> = ({
  onCategorySelect,
  selectedCategory,
  isLoading: parentLoading = false,
  onAddToCart,
  onRemoveFromCart,
  hotels,
}) => {
  // Use meal types from new DISH_CATEGORIES
  const mealTypes = Object.keys(DISH_CATEGORIES);
  const [selectedMealType, setSelectedMealType] = React.useState<string>(""); // No meal type selected initially
  const [selectedSubCategory, setSelectedSubCategory] = React.useState<string>("");

  // Get categories and subcategories for selected meal type
  const mealCategories = React.useMemo(() => {
    return selectedMealType ? Object.keys(DISH_CATEGORIES[selectedMealType] || {}) : [];
  }, [selectedMealType]);

  // Create a hotelId → hotelName map
  const hotelNameMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    hotels.forEach(hotel => { map[hotel.id] = hotel.name; });
    return map;
  }, [hotels]);

  // Use React Query for dishes
  const { data: filteredDishes = [], isLoading: dishesLoading, isError: dishesError } = useDishes({
    mealType: selectedMealType,
    category: selectedSubCategory,
    page: 1,
    limit: 12,
  });

  // Cart state for quantities (simulate, replace with your cart context if available)
  const [cart, setCart] = React.useState<Record<string, number>>({});
  const handleAdd = (dish: Dish) => {
    setCart(prev => ({ ...prev, [dish.id]: (prev[dish.id] || 0) + 1 }));
    onAddToCart?.(dish);
  };
  const handleRemove = (dish: Dish) => {
    setCart(prev => {
      const qty = (prev[dish.id] || 0) - 1;
      if (qty <= 0) {
        const { [dish.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dish.id]: qty };
    });
    onRemoveFromCart?.(dish);
  };

  return (
    <section className="pt-0 pb-0 bg-white">
      <h2 className="text-2xl font-bold mb-3 px-2 sm:px-4">What's on your mind?</h2>
      {/* Horizontal scrollable meal types (category selector) */}
      <div className="flex overflow-x-auto gap-4 px-2 sm:px-4 no-scrollbar py-2 bg-white" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {mealTypes.map((meal) => (
          <button
            key={meal}
            type="button"
            onClick={() => {
              setSelectedMealType(meal);
              setSelectedSubCategory("");
              if (onCategorySelect) onCategorySelect(meal);
            }}
            className={
              `flex flex-col items-center bg-transparent p-0 w-16 h-20 sm:w-20 sm:h-24 group relative focus:outline-none`
            }
          >
            <img
              src={MEAL_TYPE_IMAGES[meal] || "/catgoryimages/default.jpg"}
              alt={meal}
              className="block aspect-square rounded-full object-cover mb-1 w-14 h-14 sm:w-16 sm:h-16 border border-athani-100 bg-white"
              loading="lazy"
            />
            <div className="mt-1 text-center text-xs font-semibold text-gray-800 truncate w-16 md:w-20">
              {meal}
            </div>
            {/* Underline for selected */}
            {selectedMealType === meal && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-10 h-1.5 rounded-full bg-cyan-700" />
            )}
          </button>
        ))}
      </div>

      {/* Subcategory chips: show ONLY if meal type is selected */}
      {selectedMealType !== "" && mealCategories.length > 0 && (
        <div className="flex gap-2 px-2 sm:px-4 py-2 overflow-x-auto items-center no-scrollbar" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          {mealCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSubCategory(cat === selectedSubCategory ? "" : cat)}
              className={`px-4 py-2 rounded-full border-2 font-semibold text-base whitespace-nowrap transition-all ${selectedSubCategory === cat ? 'bg-cyan-700 text-white border-cyan-700' : 'bg-white border-cyan-200 text-cyan-800 hover:bg-cyan-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Dish grid and loading/empty states directly follow the filter bar, with no extra pills or divider */}
      <div className="px-2 sm:px-4">
        {dishesLoading && selectedMealType !== "" ? (
          <div className="text-center py-8 text-athani-500 font-medium animate-pulse">Loading dishes...</div>
        ) : selectedMealType === "" ? (
          <div className="py-8" />
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No dishes found for this selection.</div>
        ) : (
          <>
            {/** Chunk dishes into columns of 2 */}
            {(() => {
              const dishColumns = chunkArray(filteredDishes, 2);
              return (
                <div
                  className="flex overflow-x-auto gap-4 no-scrollbar snap-x snap-mandatory pb-2"
                  tabIndex={0}
                  aria-label="Dishes"
                  style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', overflow: 'auto', overscrollBehaviorX: 'contain' }}
                >
                  {dishColumns.map((column: Dish[], colIdx: number) => (
                    <div
                      key={colIdx}
                      className="flex flex-col gap-4 snap-start min-w-[48vw] max-w-[48vw] sm:min-w-[260px] sm:max-w-[320px]"
                      style={{ flex: '0 0 auto' }}
                    >
                      {column.map((dish: Dish, idx: number) => (
              <div
                key={dish.id || `${dish.name}-${dish.hotelName}-${idx}`}
                          className="bg-white rounded-2xl shadow-lg border border-athani-100 hover:shadow-2xl transition-all duration-200 overflow-hidden flex flex-col p-0 group relative w-full aspect-square min-w-[48vw] h-[48vw] sm:min-w-[260px] sm:h-[260px] lg:min-w-[320px] lg:h-[320px]"
                          style={{ flex: '0 0 auto' }}
              >
                {/* Dish Image */}
                          <div className="relative w-full" style={{ height: '70%', minHeight: '70%' }}>
                  <img
                    src={(() => {
                       const staticBase = import.meta.env.VITE_STATIC_URL;
                       if (!staticBase) {
                         throw new Error('VITE_STATIC_URL environment variable is not set. Please configure it in your .env file.');
                       }
                       return dish.image && !/^https?:\/\/.*/.test(dish.image)
                         ? `${staticBase}/uploads/${dish.image}`
                         : dish.image || DEFAULT_DISH_IMAGE;
                    })()}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                              style={{ objectFit: 'cover' }}
                  />
                            {/* Hotel Name Overlay */}
                            <div className="absolute left-2 bottom-2 bg-black/60 px-3 py-1 rounded-lg text-white text-sm font-bold shadow-md max-w-[80%] truncate">
                              {dish.hotelName || hotelNameMap[dish.hotelId] || "Unknown Hotel"}
                            </div>
                  {/* Price badge */}
                  <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-athani-900 font-bold shadow text-sm">
                    ₹{dish.price}
                  </div>
                </div>
                {/* Dish Details */}
                          <div className="flex-1 flex flex-col p-2 gap-0 justify-between relative">
                            {/* Dish Name and Add to Cart Button Inline */}
                            <div className="text-base font-bold text-gray-900 truncate mb-0.5">{dish.name}</div>
                            {/* Only time, directly below dish name, minimal space */}
                            <div className="text-xs text-gray-500 leading-tight mt-0.5 mb-0">25–30 mins</div>
                            {/* Cart Button/Quantity - absolutely positioned bottom right */}
                            {onAddToCart && (
                              cart[dish.id] ? (
                                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-cyan-700 rounded-full px-2 py-1 shadow-lg">
                                  <button
                                    className="text-white p-0.5 hover:bg-cyan-800 rounded"
                                    style={{ fontSize: '1rem', lineHeight: 1 }}
                                    onClick={() => handleRemove(dish)}
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="text-white font-semibold text-sm px-1 min-w-[1.5em] text-center">{cart[dish.id]}</span>
                                  <button
                                    className="text-white p-0.5 hover:bg-cyan-800 rounded"
                                    style={{ fontSize: '1rem', lineHeight: 1 }}
                                    onClick={() => handleAdd(dish)}
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={16} />
                                  </button>
                  </div>
                              ) : (
                    <button
                                  className="absolute bottom-2 right-2 flex items-center justify-center bg-cyan-700 hover:bg-cyan-800 text-white rounded-full shadow-lg transition-all"
                                  style={{ width: '2.4rem', height: '2.4rem' }}
                                  onClick={() => handleAdd(dish)}
                                  aria-label="Add to cart"
                                >
                                  <ShoppingCart size={18} />
                    </button>
                              )
                  )}
                </div>
              </div>
            ))}
            </div>
                  ))}
                </div>
              );
            })()}
            {/* Custom horizontal scroll indicator bar */}
            <div className="w-full h-1 bg-gray-200 rounded-full relative overflow-hidden mt-1">
              <div className="absolute left-0 top-0 h-full bg-cyan-500 rounded-full transition-all" style={{ width: '30%' }} />
          </div>
          </>
        )}
      </div>
    </section>
  );
};

export default WhatsOnYourMindSection;
