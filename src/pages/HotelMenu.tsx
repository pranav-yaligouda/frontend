import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, ChevronLeft, Plus, Minus, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { getDishesByHotelId } from "@/utils/hotelApi";
import { DISH_CATEGORIES } from "@/constants/dishCategorization";

const DEFAULT_HOTEL_IMAGE = "/images/hotels/default.jpg";
const DEFAULT_DISH_IMAGE = "/images/dishes/default.jpg";
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');

function resolveImageSrc(image: string | undefined | null, type: 'hotel' | 'dish' = 'dish') {
  if (!image) return type === 'hotel' ? DEFAULT_HOTEL_IMAGE : DEFAULT_DISH_IMAGE;
  // Always trim whitespace
  const trimmed = image.trim();
  if (trimmed.startsWith('data:image/')) return trimmed; // already base64 with prefix
  // If it looks like a long base64 string (no prefix, mostly alphanumeric, long enough), add prefix for JPEG
  if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length > 100) {
    return `data:image/jpeg;base64,${trimmed}`;
  }
  if (/^https?:\/\//.test(trimmed)) return trimmed; // full URL
  // If image is just a filename, serve from uploads
  return `${API_BASE}/uploads/${trimmed}`;
}

const HotelMenu = () => {
  // ...existing state/hooks
  // Skeleton loader for dish cards
  const DishSkeleton = () => (
    <div className="bg-white rounded-lg shadow p-4 flex gap-4 items-center animate-pulse min-h-[110px]">
      <div className="w-24 h-24 bg-gray-200 rounded border" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-6 bg-gray-100 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
  const { id } = useParams();
  const { addItem } = useCart();
  const [hotel, setHotel] = useState<any>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  // Fetch hotel info and dishes robustly
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        if (!id) {
          setError("Missing hotel ID in the URL.");
          setLoading(false);
          return;
        }
        let dishData: any[] = [];
        let hotelData = null;
        try {
          const dishesRes = await getDishesByHotelId(id);
          if (dishesRes && dishesRes.success) {
            dishData = Array.isArray(dishesRes.data) ? dishesRes.data : [];
          } else {
            setError(dishesRes?.error || "No dishes found for this hotel");
            dishData = [];
          }
        } catch (err: any) {
          setError(err?.message || "Failed to load menu");
          dishData = [];
        }
        setDishes(dishData);
        try {
          // Best practice: fetch hotel info by id for full details (including image)
          const { getHotelById } = await import('@/utils/hotelApi');
          const hotelRes = await getHotelById(id);
          if (hotelRes && hotelRes.success) {
            setHotel(hotelRes.data);
          } else {
            setError(hotelRes?.error || "Hotel details could not be loaded.");
          }
        } catch (err) {
          // fallback: use hotel info from first dish if available
          if (dishData.length > 0 && dishData[0].hotel) {
            setHotel(dishData[0].hotel);
          } else {
            setError("Hotel details could not be loaded.");
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load menu");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  // Categorize dishes
  const categorized = useMemo(() => {
    const cat: any = {};
    for (const dish of dishes) {
      const mealType = dish.mealType || "Other";
      const category = dish.category || "Other";
      if (!cat[mealType]) cat[mealType] = {};
      if (!cat[mealType][category]) cat[mealType][category] = [];
      cat[mealType][category].push(dish);
    }
    return cat;
  }, [dishes]);

  // Filtered dishes by search
  const filteredCategorized = useMemo(() => {
    if (!search.trim()) return categorized;
    const lower = search.toLowerCase();
    const filtered: any = {};
    for (const mealType in categorized) {
      for (const category in categorized[mealType]) {
        const filteredDishes = categorized[mealType][category].filter(
          (dish: any) =>
            dish.name.toLowerCase().includes(lower) ||
            (dish.description && dish.description.toLowerCase().includes(lower))
        );
        if (filteredDishes.length > 0) {
          if (!filtered[mealType]) filtered[mealType] = {};
          filtered[mealType][category] = filteredDishes;
        }
      }
    }
    return filtered;
  }, [categorized, search]);

  const handleQuantityChange = (dishId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [dishId]: Math.max(0, (prev[dishId] || 0) + change)
    }));
  };

  const handleAddToCart = (dish: any) => {
    const quantity = quantities[dish.id] || 1;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `${hotel?.id}_${dish.id}`,
        productId: dish.id,
        name: dish.name,
        price: dish.price,
        image: dish.image || DEFAULT_DISH_IMAGE,
        storeId: hotel?.id,
        storeName: hotel?.name
      });
    }
    toast.success(`${dish.name} added to cart!`);
    setQuantities(prev => ({ ...prev, [dish.id]: 1 }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-lg font-semibold mb-6">Loading menu...</span>
        <div className="max-w-4xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {[...Array(6)].map((_, i) => <DishSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600">
        <img src="/images/empty-state.svg" alt="Error" className="w-32 h-32 mb-4" aria-hidden="true"/>
        <span className="text-lg font-semibold">{error}</span>
        <span className="text-sm mt-2 text-gray-500">(Hotel ID: {id})</span>
        <Link to="/" className="mt-4 underline text-blue-600">Back to Home</Link>
      </div>
    );
  }

  // Meal type/category navigation
  const mealTypes = Object.keys(filteredCategorized);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-16">
      {/* Floating Back Button (mobile) */}
      <Link to="/" className="fixed top-3 left-3 z-30 md:hidden bg-white/90 rounded-full shadow p-2 border border-gray-200 hover:bg-orange-50 transition" aria-label="Back to Home">
        <ChevronLeft className="w-6 h-6 text-athani-600" />
      </Link>
      {/* Hotel Info Header */}
      <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-6 max-w-4xl mx-auto mt-6 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
         <img
          src={resolveImageSrc(hotel.image, 'hotel')}
          alt={hotel.name}
          className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border"
          onError={e => { (e.currentTarget as HTMLImageElement).src = DEFAULT_HOTEL_IMAGE; }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2 truncate">{hotel.name}
            {hotel.isPureVeg && <Badge className="bg-green-100 text-green-700 ml-2">Pure Veg</Badge>}
          </h1>
          <div className="flex flex-wrap gap-2 items-center mb-2 text-xs sm:text-sm">
            <span className="flex items-center gap-1 text-yellow-600 font-semibold"><Star className="w-4 h-4" /> {hotel.rating || "4.2"}</span>
            <span className="flex items-center gap-1 text-gray-500"><Clock className="w-4 h-4" /> {hotel.deliveryTime || "30-40 min"}</span>
            <span className="flex items-center gap-1 text-gray-500"><MapPin className="w-4 h-4" /> {hotel.address || "Address not available"}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-1">
            {hotel.cuisineTypes && hotel.cuisineTypes.map((c: string) => <Badge key={c}>{c}</Badge>)}
          </div>
          <div className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{hotel.description}</div>
        </div>
      </div>

      {/* Sticky Search & Filters */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-orange-50 to-white/80 backdrop-blur border-b border-orange-100 max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center mb-6 px-2 py-3">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            className="w-full border rounded-full py-2 px-4 pl-10 focus:ring-athani-500 focus:border-athani-500"
            placeholder="Search dishes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search dishes"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          <select
            className="border rounded-full px-3 py-2 text-sm"
            value={selectedMealType}
            onChange={e => setSelectedMealType(e.target.value)}
            aria-label="Filter by meal type"
          >
            <option value="">All Meal Types</option>
            {mealTypes.map(mt => (
              <option key={mt} value={mt}>{mt}</option>
            ))}
          </select>
          {selectedMealType && (
            <select
              className="border rounded-full px-3 py-2 text-sm"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {Object.keys(filteredCategorized[selectedMealType] || {}).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Categorized Menu */}
      <div className="max-w-4xl mx-auto">
        {mealTypes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <img src="/images/empty-state.svg" alt="No dishes" className="w-28 h-28 mb-3" aria-hidden="true"/>
            <div className="text-center text-gray-500 text-lg">No dishes found for this hotel.</div>
          </div>
        )}
        {mealTypes.map(mealType => (
          (!selectedMealType || selectedMealType === mealType) && (
            <section key={mealType} className="mb-10">
              <h2 className="text-2xl font-bold mb-4 text-athani-700 sticky top-0 bg-gradient-to-b from-orange-50 to-white z-10 py-2">{mealType}</h2>
              {Object.keys(filteredCategorized[mealType] || {}).map(category => (
                (!selectedCategory || selectedCategory === category) && (
                  <div key={category} className="mb-8">
                    <h3 className="text-xl font-semibold mb-3 text-athani-600">{category}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredCategorized[mealType][category].map((dish: any) => (
                        <article key={dish.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 flex flex-col items-stretch gap-3 group" tabIndex={0} aria-label={dish.name}>
                          <div className="relative flex-shrink-0">
                            <img
                              src={resolveImageSrc(dish.image, 'dish')}
                              alt={dish.name}
                              className="w-full h-32 object-cover rounded border"
                            />
                            {dish.isBestseller && <Badge className="absolute top-2 left-2 bg-yellow-100 text-yellow-700">Bestseller</Badge>}
                            {dish.isSpicy && <Badge className="absolute top-2 right-2 bg-red-100 text-red-700">Spicy</Badge>}
                          </div>
                          <div className="flex-1 min-h-0 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-lg text-gray-900 truncate">{dish.name}</span>
                              {dish.veg !== undefined && (
                                <span className="ml-1 text-xs">{dish.veg ? "🟢 Veg" : "🔴 Non-Veg"}</span>
                              )}
                            </div>
                            <div className="text-gray-600 text-sm mb-1 line-clamp-2">{dish.description}</div>
                            <div className="flex items-center gap-4 mt-2 flex-wrap">
                              <span className="text-lg font-bold text-primary">₹{dish.price}</span>
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" aria-label="Decrease quantity" onClick={() => handleQuantityChange(dish.id, -1)} disabled={(quantities[dish.id] || 1) <= 1}><Minus className="w-4 h-4" /></Button>
                                <span className="font-semibold text-lg">{quantities[dish.id] || 1}</span>
                                <Button size="icon" variant="ghost" aria-label="Increase quantity" onClick={() => handleQuantityChange(dish.id, 1)}><Plus className="w-4 h-4" /></Button>
                              </div>
                              <Button size="sm" className="ml-2" onClick={() => handleAddToCart(dish)} aria-label={`Add ${dish.name} to cart`}>
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </section>
          )
        ))}
      </div>
    </div>
  );
};

export default HotelMenu;
