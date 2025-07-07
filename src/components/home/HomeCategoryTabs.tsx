import * as React from "react";
import { DISH_CATEGORIES } from "@/components/hotel/dishCategories";

const CATEGORY_LABELS: Record<string, string> = {
  food_delivery: "Food Delivery",
  // Add more top-level categories if needed
};

const HomeCategoryTabs = ({ onCategorySelect, selectedCategory }: {
  onCategorySelect: (catKey: string) => void,
  selectedCategory: string
}) => {
  return (
    <div className="w-full flex flex-col items-center mb-6">
      <div className="flex gap-2 md:gap-4 mb-2">
        <button
          className={`px-4 py-2 rounded-full font-semibold border transition-all duration-150 ${selectedCategory === 'food_delivery' ? 'bg-athani-600 text-white border-athani-600 shadow' : 'bg-white text-athani-700 border-athani-200 hover:bg-athani-50'}`}
          onClick={() => onCategorySelect('food_delivery')}
        >
          Food Delivery
        </button>
        {/* Add more main category buttons here if needed */}
      </div>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">What would you like today?</h2>
        <p className="text-base md:text-lg text-gray-600">Choose between delicious restaurant food or fresh groceries</p>
      </div>
    </div>
  );
};

export default HomeCategoryTabs;
