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

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getStandardDishes } from "@/utils/hotelApi";

interface Dish {
  id: string;
  name: string;
  price: number;
  image?: string;
  hotelName: string;
  hotelId: string;
  categories?: string[];
  veg: boolean;
  description?: string;
  standardDishId?: string;
  // New categorization fields for robust filtering
  category?: string;
  mealType?: string;
  cuisineType?: string;
  subCategory?: string;
  dietaryTags?: string[]; // <-- Added for veg/non-veg badge
}

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
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");

  // Get categories and subcategories for selected meal type
  const mealCategories = useMemo(() => {
    return selectedMealType ? Object.keys(DISH_CATEGORIES[selectedMealType] || {}) : [];
  }, [selectedMealType]);

  // No subcategory/sub-dish chips needed. Only meal type and category chips are used.

  // Filter dishes by new categorization
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      if (selectedMealType && dish.mealType !== selectedMealType) return false;
      if (selectedCategoryKey && dish.category !== selectedCategoryKey) return false;
      if (selectedSubCategory && dish.subCategory !== selectedSubCategory) return false;
      return true;
    });
  }, [dishes, selectedMealType, selectedCategoryKey, selectedSubCategory]);

  return (
    <section className="py-4 bg-white">
      <h2 className="text-2xl font-bold mb-3 px-2 sm:px-4">What's on your mind?</h2>
      {/* Horizontal scrollable meal types */}
      <div className="flex overflow-x-auto gap-4 px-2 sm:px-4 no-scrollbar py-2 border-b border-athani-100 bg-white" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {mealTypes.map((meal) => (
          <button
            key={meal}
            type="button"
            onClick={() => {
              setSelectedMealType(meal);
              setSelectedCategoryKey("");
              setSelectedSubCategory("");
            }}
            className={`flex flex-col items-center group transition-all duration-200 outline-none ${selectedMealType === meal ? 'bg-white scale-105 z-10 shadow-md' : 'bg-white hover:bg-athani-50'} p-0 w-16 h-20 sm:w-20 sm:h-24 focus-visible:ring-2 focus-visible:ring-athani-500`}
          >
            <img
              src={MEAL_TYPE_IMAGES[meal] || "/catgoryimages/default.jpg"}
              alt={meal}
              className={`block aspect-square rounded-full object-cover mb-1 border transition-all duration-200 ${selectedMealType === meal ? 'w-14 h-14 sm:w-16 sm:h-16 border-4 border-primary-400 shadow-[0_0_0_4px_#e0f7fa] bg-white' : 'w-12 h-12 sm:w-14 sm:h-14 border border-athani-100 bg-white'}`}
              loading="lazy"
            />
            <div className="mt-1 text-center text-xs font-semibold text-gray-800 truncate w-16 md:w-20">
              {meal}
            </div>
          </button>
        ))}
      </div>
      {/* Show nothing if no meal type is selected */}
      {selectedMealType === "" ? null : (
        <>
          {/* Category filter for selected meal type */}
          {mealCategories.length > 0 && (
            <div className="flex overflow-x-auto gap-2 px-2 sm:px-4 no-scrollbar py-2 mt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {mealCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategoryKey(cat === selectedCategoryKey ? "" : cat);
                    setSelectedSubCategory("");
                  }}
                  className={`px-3 py-1 rounded-full border font-medium text-xs transition-all duration-150 ${selectedCategoryKey === cat ? 'bg-athani-600 text-white border-athani-600 shadow-md' : 'bg-white text-athani-700 border-athani-200 hover:bg-athani-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="w-full flex justify-center items-center my-4">
            <div className="h-[1.5px] w-2/3 bg-athani-100 rounded-full" />
          </div>
          <div className="px-2 sm:px-4">
            {isLoading ? (
              <div className="text-center py-8 text-athani-500 font-medium animate-pulse">Loading dishes...</div>
            ) : filteredDishes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No dishes found for this selection.</div>
            ) : (
              <div className="space-y-8">
                {Object.entries(
                  filteredDishes.reduce((acc, dish) => {
                    if (!acc[dish.hotelName]) acc[dish.hotelName] = [];
                    acc[dish.hotelName].push(dish);
                    return acc;
                  }, {} as Record<string, Dish[]>)
                ).map(([hotelName, dishes]) => (
                  <div key={hotelName} className="mb-8">
                    <div className="rounded-2xl shadow-lg border border-athani-100 bg-white/95 px-2 py-2 sm:px-4 sm:py-4 flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2 pt-2">
                        <span className="text-base md:text-lg font-bold text-athani-700 truncate block mb-1 sm:mb-0">{hotelName}</span>
                        {(() => {
                          const hotelId = dishes[0]?.hotelId;
                          if (!hotelId) {
                            return (
                              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gray-300 text-gray-500 font-semibold text-xs md:text-sm shadow cursor-not-allowed">
                                No Menu
                              </span>
                            );
                          }
                          return (
                            <Link
                              to={`/hotel-menu/${hotelId}`}
                              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-athani-600 hover:bg-athani-700 text-white font-semibold text-xs md:text-sm shadow transition-all duration-150 focus-visible:ring-2 focus-visible:ring-athani-500"
                              tabIndex={0}
                            >
                              View Menu
                            </Link>
                          );
                        })()}
                      </div>
                      <div className="w-full flex justify-center items-center my-2">
                        <div className="h-[1.5px] w-11/12 bg-athani-100 rounded-full" />
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory px-1 sm:px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {dishes.map((dish, idx) => (
                          <div
                            key={dish.id || `${dish.name}-${hotelName}-${idx}`}
                            className="snap-start min-w-[220px] max-w-[90vw] sm:min-w-[210px] sm:max-w-xs bg-gradient-to-b from-white to-athani-50 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-200 overflow-hidden flex flex-col items-center p-4 border border-athani-100 hover:border-athani-400 group relative"
                          >
                            <div className="relative mb-2">
                              <img
                                src={(() => {
                                  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');
                                  return dish.image && !/^https?:\/.*/.test(dish.image)
                                    ? `${apiBase}/uploads/${dish.image}`
                                    : dish.image || DEFAULT_DISH_IMAGE;
                                })()}
                                alt={dish.name}
                                className="w-24 h-24 object-cover rounded-full border-2 border-athani-200 shadow-sm group-hover:scale-105 transition-all duration-200"
                              />
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
                            <div className="font-semibold text-base text-gray-900 text-center mb-1 line-clamp-1">{dish.name}</div>
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs font-bold text-athani-600">₹{dish.price}</span>
                            </div>
                            <button
                              className="mt-2 px-4 py-1.5 bg-athani-600 text-white rounded-full text-xs font-semibold shadow-lg hover:bg-athani-700 hover:scale-105 focus-visible:ring-2 focus-visible:ring-athani-500 transition-all duration-150 group-hover:-translate-y-1"
                              onClick={() => onAddToCart && onAddToCart(dish)}
                              tabIndex={0}
                              aria-label={`Add ${dish.name} to cart`}
                            >
                              Add to Cart
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

    </section>
  );
};

export default WhatsOnYourMindSection;
