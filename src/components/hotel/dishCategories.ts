
// Use this for categorization and filtering in DishModal

export interface DishCategory {
  key: string;
  label: string;
  subCategories: { key: string; label: string }[];
}


export const DISH_CATEGORIES: DishCategory[] = [
  {
    key: 'breakfast_tiffins',
    label: 'Breakfast & Tiffins',
    subCategories: [
      { key: 'south_indian_tiffins', label: 'South Indian Tiffins' },
      { key: 'indian_breakfast_staples', label: 'Indian Breakfast Staples' },
      { key: 'breakfast_combos_specials', label: 'Breakfast Combos & Specials' },
    ],
  },
  {
    key: 'indian_main_course',
    label: 'Indian Main Course',
    subCategories: [
      { key: 'vegetable_curries', label: 'Vegetable Curries' },
      { key: 'paneer_curries', label: 'Paneer Curries' },
      { key: 'dal', label: 'Dal & Lentil Preparations' },
      { key: 'mushroom_babycorn', label: 'Mushroom & Baby Corn Curries' },
      { key: 'aloo_gobi_preparations', label: 'Aloo & Gobi Preparations' },
    ],
  },
  {
    key: 'indian_breads_rice',
    label: 'Indian Breads & Rice',
    subCategories: [
      { key: 'breads', label: 'Breads' },
      { key: 'plain_rice_pulao', label: 'Plain Rice & Pulao' },
      { key: 'biryani', label: 'Biryani' },
    ],
  },
  {
    key: 'chinese',
    label: 'Chinese & Pan-Asian',
    subCategories: [
      { key: 'chinese_starters', label: 'Chinese Starters' },
      { key: 'chinese_gravies', label: 'Chinese Gravies' },
      { key: 'noodles', label: 'Noodles' },
      { key: 'fried_rice', label: 'Fried Rice' },
      { key: 'pan_asian_specialties', label: 'Pan-Asian Specialties' },
    ],
  },
  {
    key: 'continental_fast_food',
    label: 'Continental & Fast Food',
    subCategories: [
      { key: 'burgers', label: 'Burgers' },
      { key: 'sandwiches', label: 'Sandwiches' },
      { key: 'pizzas', label: 'Pizzas' },
      { key: 'pasta', label: 'Pasta' },
      { key: 'fries_sides', label: 'Fries & Sides' },
    ],
  },
  {
    key: 'tandoor_grills',
    label: 'Tandoor & Grills',
    subCategories: [
      { key: 'veg_tandoor_kebabs', label: 'Veg Tandoor & Kebabs' },
      { key: 'chicken_tandoor_grills', label: 'Chicken Tandoor & Grills' },
    ],
  },
  {
    key: 'mutton_seafood_delights',
    label: 'Mutton & Seafood Delights',
    subCategories: [
      { key: 'mutton_gravies_curries', label: 'Mutton Gravies & Curries' },
      { key: 'mutton_dry_preparations', label: 'Mutton Dry Preparations' },
      { key: 'seafood_delights', label: 'Seafood Delights' },
    ],
  },
  {
    key: 'egg_preparations',
    label: 'Egg Preparations',
    subCategories: [
      { key: 'egg_curries_gravies', label: 'Egg Curries & Gravies' },
      { key: 'egg_dry_preparations', label: 'Egg Dry Preparations' },
    ],
  },
  {
    key: 'soups_salads',
    label: 'Soups, Salads & Raita',
    subCategories: [
      { key: 'soups', label: 'Soups' },
      { key: 'salads', label: 'Salads' },
      { key: 'raita_curd', label: 'Raita & Curd' },
      { key: 'papad', label: 'Papad' },
    ],
  },
  {
    key: 'desserts_sweets',
    label: 'Desserts & Sweets',
    subCategories: [
      { key: 'indian_sweets', label: 'Indian Sweets' },
      { key: 'ice_cream_sundaes', label: 'Ice Cream & Sundaes' },
      { key: 'baked_desserts_others', label: 'Baked & Other Desserts' },
    ],
  },
  {
    key: 'beverages',
    label: 'Beverages',
    subCategories: [
      { key: 'hot_beverages', label: 'Hot Beverages' },
      { key: 'fresh_juices', label: 'Fresh Juices' },
      { key: 'milkshakes', label: 'Milkshakes' },
      { key: 'lassi_buttermilk', label: 'Lassi & Buttermilk' },
      { key: 'sodas_mocktails', label: 'Sodas & Mocktails' },
    ],
  },
];
