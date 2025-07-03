// Optimized Dish Categorization for Multi-Hotel Delivery App
export const MEAL_TYPES = [
  'Breakfast', 'Lunch / Dinner / Main Course', 'Snacks & Appetizers', 'Desserts', 'Beverages'
];

export const CUISINE_TYPES = [
  'South Indian', 'North Indian', 'Indo-Chinese', 'Continental / Global'
];

export const DIETARY_TAGS = [
  'Vegetarian', 'Vegan', 'Jain', 'Gluten-Free', 'Eggetarian', 'Non-Vegetarian'
];

// Maps each category to its cuisine type for perfect auto-filling
export const MEAL_TYPE_IMAGES: Record<string, string> = {
  Breakfast: '/dishimages/breakfast.jpg',
  'Lunch / Dinner / Main Course': '/dishimages/lunch.jpg',
  'Lunch / Dinner': '/dishimages/lunch.jpg', // fallback for alt label
  'Snacks & Appetizers': '/dishimages/snacks.jpg',
  'Indo-Chinese Specials': '/dishimages/indo-chinese.jpg',
  'Indo-Chinese Special': '/dishimages/indo-chinese.jpg', // fallback for alt label
  'Breads & Accompaniments': '/dishimages/breads.jpg',
  Desserts: '/dishimages/desserts.jpg',
  Beverages: '/dishimages/beverages.jpg',
};

export const CATEGORY_TO_CUISINE: Record<string, string> = {
  // Breakfast
  'Idli & Vada': 'South Indian',
  'Dosa & Uttapam': 'South Indian',
  'Puri': 'South Indian',
  'Rice-Based Breakfast': 'South Indian',
  'Other Breakfast Favorites': 'South Indian',
  // Lunch / Main Course
  'Biryani & Pulao': 'North Indian',
  'Indian Curries (Gravy & Dry)': 'North Indian',
  'Karnataka Special Mains': 'South Indian',
  'Meal Combos / Thalis': 'South Indian',
  // Snacks & Appetizers
  'Fried Snacks': 'North Indian',
  'Chaats': 'North Indian',
  'Tandoor & Grills': 'North Indian',
  'Local Karnataka Snacks': 'South Indian',
  'Fast Food & Others': 'Continental / Global',
  // Indo-Chinese Specials
  'Soups': 'Indo-Chinese',
  'Dry Starters': 'Indo-Chinese',
  'Noodles': 'Indo-Chinese',
  'Fried Rice': 'Indo-Chinese',
  'Gravies': 'Indo-Chinese',
  // Breads & Accompaniments
  'Indian Breads': 'North Indian',
  'Rice (Plain)': 'South Indian',
  // Desserts
  'Indian Sweets': 'North Indian',
  'Ice Creams': 'Continental / Global',
  'Other Desserts': 'Continental / Global',
  // Beverages
  'Hot Beverages': 'South Indian',
  'Cold Beverages': 'Continental / Global',
};

export const DISH_CATEGORIES = {
  Breakfast: {
    'Idli & Vada': ['Idli (Plain)', 'Rava Idli', 'Thatte Idli', 'Medu Vada', 'Masala Vada', '2 Idli 1 Vada', '1 Idli 1 Vada'],
    'Dosa & Uttapam': ['Masala Dosa', 'Plain Dosa', 'Paper Dosa', 'Butter Dosa', 'Set Dosa', 'Rava Dosa', 'Mysore Masala Dosa', 'Neer Dosa', 'Onion Uttapam', 'Mixed Veg Uttapam', 'Plain Uttapam'],
    'Puri': ['Puri Bhaji', 'Puri Kurma', 'Puri Saagu'],
    'Rice-Based Breakfast': ['Khara Bath', 'Kesari Bath', 'Chow Chow Bath', 'Pongal (Venn)', 'Pongal (Sweet)', 'Lemon Rice', 'Tomato Bath'],
    'Other Breakfast Favorites': ['Upma (Rava)', 'Upma (Semiya)', 'Akki Roti', 'Maddur Vada', 'Poha', 'Bread Omelette']
  },
  'Lunch / Dinner / Main Course': {
    'Biryani & Pulao': ['Chicken Biryani', 'Mutton Biryani', 'Vegetable Biryani', 'Paneer Biryani', 'Donne Biryani (Chicken)', 'Donne Biryani (Mutton)', 'Donne Biryani (Veg)', 'Vegetable Pulao', 'Ghee Rice', 'Jeera Rice', 'Mushroom Pulao'],
    'Indian Curries (Gravy & Dry)': ['Paneer Butter Masala', 'Kadai Paneer', 'Palak Paneer', 'Shahi Paneer', 'Matar Paneer', 'Dal Tadka', 'Dal Makhani', 'Dal Fry', 'Chana Masala', 'Veg Kolhapuri', 'Mixed Vegetable Curry', 'Navratan Korma', 'Malai Kofta', 'Butter Chicken', 'Chicken Tikka Masala', 'Kadai Chicken', 'Chicken Do Pyaza', 'Chicken Korma', 'Chicken Chettinad', 'Mutton Rogan Josh', 'Mutton Curry', 'Lamb Korma', 'Keema Curry', 'Fish Curry', 'Prawn Masala', 'Fish Fry'],
    'Karnataka Special Mains': ['Bisi Bele Bath', 'Vangi Bath', 'Puliyogare', 'Curd Rice', 'Sambar', 'Rasam (Saaru)', 'Huli', 'Gojju (Pineapple)', 'Gojju (Tomato)', 'Palya (Cabbage)', 'Palya (Beans)'],
    'Meal Combos / Thalis': ['South Indian Thali (Veg)', 'South Indian Thali (Non-Veg)', 'North Indian Thali (Veg)', 'North Indian Thali (Non-Veg)', 'Mini Meals', 'Roti Meal']
  },
  'Snacks & Appetizers': {
    'Fried Snacks': ['Samosa (Veg)', 'Samosa (Paneer)', 'Pakora (Onion)', 'Pakora (Paneer)', 'Pakora (Mixed Veg)', 'Mirchi Bajji', 'Bonda (Potato)', 'Bonda (Mangalore Bajji)', 'Cutlet (Veg)', 'Cutlet (Chicken)'],
    'Chaats': ['Pani Puri', 'Dahi Puri', 'Sev Puri', 'Bhel Puri', 'Papdi Chaat', 'Dahi Bhalla'],
    'Tandoor & Grills': ['Chicken Tikka', 'Paneer Tikka', 'Tandoori Chicken', 'Fish Tikka', 'Seekh Kebab (Chicken)', 'Seekh Kebab (Mutton)', 'Hara Bhara Kebab'],
    'Local Karnataka Snacks': ['Churumuri', 'Nippattu', 'Kodubale', 'Maddur Vada'],
    'Fast Food & Others': ['French Fries', 'Sandwiches (Veg)', 'Sandwiches (Chicken)', 'Burgers (Veg)', 'Burgers (Chicken)', 'Vada Pav', 'Pav Bhaji']
  },
  'Indo-Chinese Specials': {
    'Soups': ['Manchow Soup', 'Hot & Sour Soup', 'Sweet Corn Soup (Veg)', 'Sweet Corn Soup (Chicken)', 'Clear Soup (Veg)', 'Clear Soup (Chicken)'],
    'Dry Starters': ['Gobi Manchurian Dry', 'Chilli Gobi Dry', 'Chicken Manchurian Dry', 'Chilli Chicken Dry', 'Paneer Chilli Dry', 'Veg Crispy', 'Chicken Lollipop'],
    'Noodles': ['Hakka Noodles (Veg)', 'Hakka Noodles (Chicken)', 'Hakka Noodles (Egg)', 'Schezwan Noodles (Veg)', 'Schezwan Noodles (Chicken)', 'Schezwan Noodles (Egg)', 'Chilli Garlic Noodles'],
    'Fried Rice': ['Veg Fried Rice', 'Chicken Fried Rice', 'Egg Fried Rice', 'Schezwan Fried Rice (Veg)', 'Schezwan Fried Rice (Chicken)', 'Schezwan Fried Rice (Egg)', 'Triple Schezwan Fried Rice'],
    'Gravies': ['Veg Manchurian Gravy', 'Chicken Manchurian Gravy', 'Paneer Chilli Gravy']
  },
  'Breads & Accompaniments': {
    'Indian Breads': ['Naan (Butter)', 'Naan (Garlic)', 'Naan (Plain)', 'Roti', 'Tandoori Roti', 'Laccha Paratha', 'Paratha (Aloo)', 'Paratha (Gobi)', 'Paratha (Paneer)', 'Chapati'],
    'Rice (Plain)': ['Steamed Rice', 'Ghee Rice']
  },
  Desserts: {
    'Indian Sweets': ['Gulab Jamun', 'Rasgulla', 'Rasmalai', 'Jalebi', 'Gajar Halwa', 'Mysore Pak', 'Holige / Obbattu', 'Payasam (Semiya)', 'Payasam (Rice)', 'Payasam (Shavige)'],
    'Ice Creams': ['Vanilla', 'Chocolate', 'Strawberry', 'Butterscotch', 'Kulfi'],
    'Other Desserts': ['Fruit Salad', 'Fruit Custard', 'Brownie with Ice Cream']
  },
  Beverages: {
    'Hot Beverages': ['Filter Coffee', 'Masala Chai', 'Ginger Tea', 'Green Tea', 'Black Coffee', 'Hot Milk'],
    'Cold Beverages': ['Fresh Juice (Orange)', 'Fresh Juice (Pineapple)', 'Fresh Juice (Watermelon)', 'Fresh Juice (Mosambi)', 'Milkshake (Mango)', 'Milkshake (Chocolate)', 'Milkshake (Banana)', 'Lassi (Sweet)', 'Lassi (Salted)', 'Lassi (Mango)', 'Buttermilk / Chaas', 'Soft Drinks', 'Mineral Water']
  }
};
