import * as React from "react";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { MEAL_TYPES, CUISINE_TYPES, DIETARY_TAGS, DISH_CATEGORIES, CATEGORY_TO_CUISINE } from '@/constants/dishCategorization';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Utility to flatten all dish options for search
const getAllDishOptions = () => {
  const options: { dishName: string; mealType: string; category: string; cuisineType: string }[] = [];
  for (const mealType of Object.keys(DISH_CATEGORIES)) {
    for (const category of Object.keys(DISH_CATEGORIES[mealType])) {
      const cuisineType = CATEGORY_TO_CUISINE[category] || '';
      for (const dishName of DISH_CATEGORIES[mealType][category]) {
        options.push({ dishName, mealType, category, cuisineType });
      }
    }
  }
  return options;
};

// DishModal: Add/Edit Dish with direct categorization (no standard dish logic)
const dishSchema = z.object({
  mealType: z.string().min(1, 'Select a meal type'),
  cuisineType: z.string().min(1, 'Select a cuisine type'),
  category: z.string().min(1, 'Select a category'),
  dishName: z.string().min(1, 'Select or enter a dish name'),
  dietaryTags: z.array(z.string()).min(1, 'Select at least one dietary tag'),
  price: z.coerce.number().min(1, 'Price must be at least 1'),
  description: z.string().optional(),
  image: z.any().optional(),
});

type DishFormType = z.infer<typeof dishSchema>;

export const DishModal = ({ open, onSubmit, initial, loading, onClose } : {
  open: boolean;
  onSubmit: (data: FormData) => void;
  initial?: Partial<DishFormType>;
  loading?: boolean;
  onClose?: () => void;
}) => {
  // New categorization states
  const [mealType, setMealType] = React.useState(initial?.mealType || '');
  const [cuisineType, setCuisineType] = React.useState(initial?.cuisineType || '');
  const [category, setCategory] = React.useState(initial?.category || '');
  const [dishName, setDishName] = React.useState(initial?.dishName || '');
  const [dietaryTags, setDietaryTags] = React.useState<string[]>(initial?.dietaryTags || []);
  const [imagePreview, setImagePreview] = React.useState<string | null>(initial?.image ?? null);
  const [customDishName, setCustomDishName] = React.useState(''); // for free text entry

  // Dish search state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showDishDropdown, setShowDishDropdown] = React.useState(false);
  const allDishOptions = React.useMemo(() => {
  // Audit: Check for missing category-to-cuisine mappings
  const missingMappings = [];
  for (const mealType of Object.keys(DISH_CATEGORIES)) {
    for (const category of Object.keys(DISH_CATEGORIES[mealType])) {
      if (!CATEGORY_TO_CUISINE[category]) {
        missingMappings.push(category);
      }
    }
  }
  if (missingMappings.length > 0) {
    // This will only log in dev, not break user flow
    console.warn('Missing CATEGORY_TO_CUISINE mappings for categories:', missingMappings);
  }
  return getAllDishOptions();
}, []);
  const filteredDishOptions = React.useMemo(() => {
    if (!searchTerm) return [];
    const lower = searchTerm.toLowerCase();
    return allDishOptions.filter(opt => opt.dishName.toLowerCase().includes(lower));
  }, [searchTerm, allDishOptions]);

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<DishFormType>({
    resolver: zodResolver(dishSchema),
    defaultValues: initial || {
      mealType: '',
      cuisineType: '',
      category: '',
      dishName: '',
      dietaryTags: [],
      price: 0,
      description: '',
      image: null
    },
  });

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

const submitHandler = async (values: DishFormType) => {
  // Prevent empty or placeholder dish names
  const finalDishName = customDishName.trim() ? customDishName.trim() : values.dishName;
  if (!finalDishName || finalDishName === 'Select Dish' || finalDishName === 'Add New Dish') {
    alert('Please select or enter a valid dish name.');
    return;
  }
  const payload = new FormData();
  // Required fields for backend
  payload.append('mealType', values.mealType);
  payload.append('cuisineType', values.cuisineType);
  payload.append('category', values.category);
  payload.append('dishName', finalDishName);
  payload.append('name', finalDishName); // for backend uniqueness check
  // --- FIX: Always include a unique standardDish field ---
  // Try to find the canonical dish option (standard dish)
  const stdDish = allDishOptions.find(opt => opt.dishName.toLowerCase() === finalDishName.toLowerCase());
  payload.append('standardDish', stdDish ? stdDish.dishName : finalDishName);
  // ------------------------------------------------------
  payload.append('price', String(Number(values.price)));
  payload.append('description', values.description || '');
  if (values.image instanceof File) {
    payload.append('image', values.image);
  }
  (values.dietaryTags || []).forEach(tag => payload.append('dietaryTags', tag));
  // Log outgoing form data for debugging
  console.log('Submitting dish:', Object.fromEntries(payload.entries()));
  onSubmit(payload);
};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="dish-modal-desc">
        {/* Accessibility: Hidden description for screen readers */}
        <div id="dish-modal-desc" className="sr-only">Add or edit a dish, including categorization, dietary tags, and image.</div>
        <DialogHeader>
          <DialogTitle>Add Dish</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(submitHandler)}>
          {/* Dish Name Searchable Dropdown */}
          <div>
            <Label>Search Dish Name</Label>
            <Controller
              name="dishName"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  className="w-full border rounded p-2 mb-2"
                  placeholder="Type to search for a dish (e.g. dosa, idli, etc)"
                  value={field.value}
                  onChange={e => {
                    const val = e.target.value;
                    field.onChange(val);
                    setCustomDishName('');
                    setSearchTerm(val);
                    setShowDishDropdown(true);
                    // Only reset if not a standard dish
                    const found = allDishOptions.find(opt => opt.dishName.toLowerCase() === val.toLowerCase());
                    if (!found) {
                      setValue('mealType', '');
                      setValue('category', '');
                      setValue('cuisineType', '');
                    }
                  }}
                  autoComplete="off"
                  disabled={loading}
                />
              )}
            />
            {/* Dropdown suggestions */}
            {showDishDropdown && searchTerm && filteredDishOptions.length > 0 && (
              <div className="border rounded bg-white shadow z-10 max-h-48 overflow-y-auto absolute w-full">
                {filteredDishOptions.map((opt, idx) => (
                  <div
                    key={`${opt.mealType}|${opt.category}|${opt.dishName}`}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setValue('dishName', opt.dishName);
                      setValue('mealType', opt.mealType);
                      setValue('category', opt.category);
                      setValue('cuisineType', opt.cuisineType);
                      setSearchTerm(opt.dishName); // update search input to selected dish
                      setShowDishDropdown(false);
                    }}
                  >
                    <span className="font-semibold">{opt.dishName}</span>
                    <span className="ml-2 text-xs text-gray-500">({opt.mealType} / {opt.category} / {opt.cuisineType})</span>
                  </div>
                ))}
              </div>
            )}
            {showDishDropdown && searchTerm && filteredDishOptions.length === 0 && (
              <div className="border rounded bg-white shadow z-10 max-h-48 overflow-y-auto absolute w-full">
                <div className="px-3 py-2 text-gray-500">No matching dish found.</div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-primary"
                  onClick={() => {
                    setDishName('__custom');
                    setCustomDishName(searchTerm);
                    setShowDishDropdown(false);
                    setValue('dishName', '__custom');
                  }}
                >
                  + Add New Dish: <span className="font-semibold">{searchTerm}</span>
                </div>
              </div>
            )}
          </div>
          {/* Category, Cuisine, etc. (shown only after dish is selected or add new) */}
          {watch('dishName') && watch('dishName') !== '' && (
            <>
              <div className="mt-2">
                <Label>Meal Type</Label>
                <Controller
                  name="mealType"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border rounded p-2"
                      disabled={loading}
                    >
                      <option value="">Select Meal Type</option>
                      {MEAL_TYPES.map(mealType => (
                        <option key={mealType} value={mealType}>{mealType}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.mealType && <span className="text-red-500 text-xs">{errors.mealType.message}</span>}
              </div>

              <div>
                <Label>Cuisine Type</Label>
                <Controller
                  name="cuisineType"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border rounded p-2"
                      disabled={loading}
                    >
                      <option value="">Select Cuisine Type</option>
                      {CUISINE_TYPES.map(cuisineType => (
                        <option key={cuisineType} value={cuisineType}>{cuisineType}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.cuisineType && <span className="text-red-500 text-xs">{errors.cuisineType.message}</span>}
              </div>

              <div>
                <Label>Category</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border rounded p-2"
                      disabled={loading}
                    >
                      <option value="">Select Category</option>
                      {(DISH_CATEGORIES[watch('mealType')] ? Object.keys(DISH_CATEGORIES[watch('mealType')]) : []).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
              </div>

              <div>
                <Label>Dietary Tags</Label>
                <Controller
                  name="dietaryTags"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1">
                      {DIETARY_TAGS.map(tag => {
                        let disabled = loading;
                        // Prevent Veg & Non-Veg together
                        if (tag === 'Vegetarian' && field.value.includes('Non-Vegetarian')) disabled = true;
                        if (tag === 'Non-Vegetarian' && field.value.includes('Vegetarian')) disabled = true;
                        return (
                          <label key={tag} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.value.includes(tag)}
                              onChange={e => {
                                if (e.target.checked) {
                                  // Remove conflicting tag
                                  if (tag === 'Vegetarian') field.onChange([...field.value.filter(t => t !== 'Non-Vegetarian'), tag]);
                                  else if (tag === 'Non-Vegetarian') field.onChange([...field.value.filter(t => t !== 'Vegetarian'), tag]);
                                  else field.onChange([...field.value, tag]);
                                } else {
                                  field.onChange(field.value.filter((t: string) => t !== tag));
                                }
                              }}
                              disabled={disabled}
                            />
                            {tag}
                          </label>
                        );
                      })}
                      {/* Error message for dietary tags */}
                      {errors.dietaryTags && (
                        <span className="text-red-500 text-xs">{errors.dietaryTags.message as string}</span>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <Label>Price (₹)</Label>
                <Controller name="price" control={control} render={({ field }) => (
                  <Input type="number" min={1} {...field} disabled={loading} />
                )} />
                {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Controller name="description" control={control} render={({ field }) => (
                  <Textarea {...field} disabled={loading} />
                )} />
              </div>

              <div>
                <Label>Dish Image (Optional)</Label>
                <Input type="file" accept="image/*" onChange={onImageChange} disabled={loading} />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 max-h-32 rounded" />
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Dish'}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
