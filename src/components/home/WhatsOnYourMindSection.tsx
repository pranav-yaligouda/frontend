import { DISH_CATEGORIES, MEAL_TYPE_IMAGES } from "@/constants/dishCategorization";

import React, { useState, useMemo, useEffect } from "react";
import type { Dish } from "@/types/Dish";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getStandardDishes } from "@/utils/hotelApi";

interface WhatsOnYourMindSectionProps {
  onCategorySelect?: (catKey: string) => void;
  selectedCategory?: string;
  dishes: Dish[];
  isLoading: boolean;
  onAddToCart?: (dish: Dish) => void;
}

const DEFAULT_DISH_IMAGE = "/images/dishes/default.jpg";

const WhatsOnYourMindSection: React.FC<WhatsOnYourMindSectionProps> = ({
  onCategorySelect,
  selectedCategory,
  dishes = [],
  isLoading = false,
  onAddToCart,
}) => {
  // Use meal types from new DISH_CATEGORIES
  const mealTypes = Object.keys(DISH_CATEGORIES);
  const [selectedMealType, setSelectedMealType] = useState<string>(""); // No meal type selected initially
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");

  // Get categories and subcategories for selected meal type
  const mealCategories = useMemo(() => {
    return selectedMealType ? Object.keys(DISH_CATEGORIES[selectedMealType] || {}) : [];
  }, [selectedMealType]);

  // Filter dishes by new categorization
  const filteredDishes = useMemo(() => {
    const filtered = dishes.filter((dish) => {
      if (selectedMealType && dish.mealType !== selectedMealType) return false;
      if (selectedSubCategory && dish.category !== selectedSubCategory) return false;
      return true;
    });
    return filtered;
  }, [dishes, selectedMealType, selectedSubCategory]);

  return (
    <section className="py-4 bg-white">
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
        {isLoading && selectedMealType !== "" ? (
          <div className="text-center py-8 text-athani-500 font-medium animate-pulse">Loading dishes...</div>
        ) : selectedMealType === "" ? (
          <div className="py-8" />
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No dishes found for this selection.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-athani-100 p-4 sm:p-6 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish, idx) => (
              <div
                key={dish.id || `${dish.name}-${dish.hotelName}-${idx}`}
                className="bg-white rounded-2xl shadow-lg border border-athani-100 hover:shadow-2xl transition-all duration-200 overflow-hidden flex flex-col p-0 group relative"
              >
                {/* Dish Image */}
                <div className="relative w-full h-44 sm:h-48 bg-athani-50 overflow-hidden">
                  <img
                    src={(() => {
                      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');
                      return dish.image && !/^https?:\/.*/.test(dish.image)
                        ? `${apiBase}/uploads/${dish.image}`
                        : dish.image || DEFAULT_DISH_IMAGE;
                    })()}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Price badge */}
                  <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-athani-900 font-bold shadow text-sm">
                    ₹{dish.price}
                  </div>
                  {/* Offer badge example */}
                  <div className="absolute top-3 left-3 bg-yellow-300 text-red-700 font-extrabold px-2 py-1 rounded shadow text-xs">
                    FLAT 50% OFF
                  </div>
                </div>
                {/* Dish Details */}
                <div className="flex-1 flex flex-col p-4 gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    {/* Hotel Name */}
                    <span className="text-base font-bold text-athani-700 truncate block">{dish.hotelName}</span>
                    {/* Rating */}
                    <span className="ml-auto flex items-center gap-1 text-green-700 font-semibold text-sm bg-green-100 px-2 py-0.5 rounded-full"><svg width='16' height='16' fill='currentColor' className='inline'><circle cx='8' cy='8' r='8'/></svg>4.0</span>
                  </div>
                  {/* Dish Name */}
                  <div className="text-lg font-bold text-gray-900 truncate">{dish.name}</div>
                  {/* Meta: time, distance */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span>30-35 mins</span>
                    <span>•</span>
                    <span>1.3 km</span>
                  </div>
                  {/* Badges row */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {/* Veg/Non-Veg Badge - top right */}
                    <div className="absolute top-1 right-1 z-10">
                      {dish.dietaryTags?.includes('Non-Vegetarian') ? (
                        <div className="relative group">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 shadow border border-red-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
                            Non-Veg
                          </span>
                          <span className="absolute hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">Non-Vegetarian</span>
                        </div>
                      ) : dish.dietaryTags?.includes('Vegetarian') ? (
                        <div className="relative group">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow border border-green-200">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
                            Veg
                          </span>
                          <span className="absolute hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">Vegetarian</span>
                        </div>
                      ) : (typeof dish.veg === 'boolean' ? (
                        <div className="relative group">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shadow border ${dish.veg ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}> 
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"/></svg>
                            {dish.veg ? 'Veg' : 'Non-Veg'}
                          </span>
                          <span className="absolute hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">{dish.veg ? 'Vegetarian' : 'Non-Vegetarian'}</span>
                        </div>
                      ) : null)}
                    </div>
                  </div>
                  {/* Add to Cart Button */}
                  {onAddToCart && (
                    <button
                      className="mt-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg font-semibold transition-all"
                      onClick={() => onAddToCart(dish)}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WhatsOnYourMindSection;
