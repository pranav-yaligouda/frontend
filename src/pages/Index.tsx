import * as React from "react";
import type { Dish } from "@/types/dish";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StoreCard from "@/components/store/StoreCard";
import PerfectionSection from "@/components/home/PerfectionSection";
import { ChevronRight, Star, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

import WhatsOnYourMindSection from "@/components/home/WhatsOnYourMindSection";
import { useHotels } from '@/hooks/useHotels';
import { useStores } from '@/hooks/useStores';
import { useProducts } from '@/hooks/useProducts';
import { useDishes } from '@/hooks/useDishes';
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types/product";
import type { Store } from "@/types/store";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllStoreProducts } from '@/api/product';
import ProductGrid from "@/components/product/ProductGrid";


const PRODUCT_CATEGORIES = [
  'Vegetables', 'Fruits', 'Groceries', 'Medicines', 'Dairy', 'Household', 'Stationary'
];

const Index = () => {
  type Hotel = {
    id: string;
    _id?: string;
    name: string;
    image?: string;
    rating?: number;
    location?: string | { address?: string };
    cuisine?: string;
    dishes?: Dish[];
    deliveryTime?: string;
  };
  const { addItem } = useCart();

  // Hotels
  const { data: hotels = [], isLoading: hotelsLoading, isError: hotelsError } = useHotels();
  // Dishes (flattened from hotels)
  const { data: dishes = [], isLoading: dishesLoading, isError: dishesError } = useDishes({});
  // Stores
  const { data: groceryStores = [], isLoading: storesLoading, isError: storesError } = useStores();
  // Products (with filters)
  const [selectedGroceryCategory, setSelectedGroceryCategory] = React.useState('');
  const [selectedGroceryStore, setSelectedGroceryStore] = React.useState<string | null>(null);
  const [grocerySearch, setGrocerySearch] = React.useState('');
  const [storeInventory, setStoreInventory] = React.useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = React.useState(true);

  React.useEffect(() => {
    setProductsLoading(true);
    getAllStoreProducts()
      .then(res => {
        if (res.data && res.data.data && Array.isArray(res.data.data.items)) {
          setStoreInventory(
            res.data.data.items.map(product => ({
              ...product,
              id: product._id?.toString() || product.id,
              storeId: product.storeId?.toString() || product.storeId,
            }))
          );
        } else {
          setStoreInventory([]);
          if (res.data && 'error' in res.data && typeof res.data.error === 'string') {
            console.error('Store products error:', res.data.error);
          }
        }
      })
      .catch(err => {
        setStoreInventory([]);
        console.error('Store products fetch failed:', err);
      })
      .finally(() => setProductsLoading(false));
  }, []);

  const handleAddDishToCart = (dish: Dish) => {
    // Defensive: Only allow if both dish.id and dish.hotelId are valid
    if (!dish.id || !dish.hotelId || dish.id === 'undefined' || dish.hotelId === 'undefined') {
      toast.error('Cannot add to cart: Invalid dish or hotel ID. Please refresh or contact support.');
      console.error('Add to cart failed: missing dish.id or dish.hotelId', dish);
      return;
    }
    addItem({
      id: `${dish.hotelId}_${dish.id}`,
      productId: dish.id,
      name: dish.name,
      price: dish.price,
      image: (() => {
        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');
        return dish.image && !/^https?:\/\//.test(dish.image)
          ? `${apiBase}/uploads/${dish.image}`
          : dish.image;
      })(),
      storeId: dish.hotelId,
      storeName: dish.hotelName,
      type: 'dish',
    });
    toast.success(`${dish.name} added to cart!`);
  };

  const [selectedCategory, setSelectedCategory] = React.useState<string>("food_delivery");
  const sectionRefs = {
    food_delivery: React.useRef<HTMLDivElement>(null),
    // Add more refs for other categories if needed
  };

  const handleCategorySelect = (catKey: string) => {
    setSelectedCategory(catKey);
    setTimeout(() => {
      sectionRefs[catKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Add handler for adding product to cart
  const handleAddProductToCart = React.useCallback((product: Product) => {
    if (!product.id || !product.storeId) {
      toast.error('Cannot add to cart: Invalid product or store ID.');
      return;
    }
    addItem({
      id: `${product.storeId}_${product.id}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeId: product.storeId,
      storeName: product.storeName,
      type: 'product',
    });
    toast.success(`${product.name} added to cart!`);
  }, [addItem]);

  // Optional: handler for quick view
  const handleQuickView = React.useCallback((product: Product) => {
    // Implement modal or drawer logic here, e.g. setQuickViewProduct(product); setShowQuickView(true);
    toast.info(`Quick view for ${product.name}`);
  }, []);

  return (
    <div className="pb-16 bg-gradient-to-b from-primary-100 via-primary-50 to-white min-h-screen">
      {/* Food Delivery Section (default) */}
      <div ref={sectionRefs.food_delivery}>
        <section className="bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 mx-auto">
            <Tabs defaultValue="food" className="w-full">
              {/* Advanced Food & Grocery Switch */}
              <div className="flex justify-center w-full mt-2 mb-4">
                <div className="w-full max-w-lg px-2">
                  <TabsList
                    className="flex w-full rounded-full bg-white shadow-lg border border-athani-100 p-1 gap-1 items-center justify-between
                      sticky top-[3.5rem] z-40 transition-all backdrop-blur-md
                      md:static md:backdrop-blur-0 md:shadow-none md:border-0"
                    style={{ minHeight: '3.25rem' }}
                  >
                    <TabsTrigger
                      value="food"
                      className="flex-1 px-4 py-2.5 rounded-full font-bold text-base md:text-lg transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-athani-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-athani-500 data-[state=active]:to-athani-400 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=inactive]:bg-transparent data-[state=inactive]:text-athani-700"
                      style={{ minWidth: '120px', minHeight: '2.75rem' }}
                    >
                      Food Delivery
                    </TabsTrigger>
                    <TabsTrigger
                      value="grocery"
                      className="flex-1 px-4 py-2.5 rounded-full font-bold text-base md:text-lg transition-all duration-200 border-0 focus:outline-none focus:ring-2 focus:ring-green-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-400 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 data-[state=inactive]:bg-transparent data-[state=inactive]:text-athani-700"
                      style={{ minWidth: '120px', minHeight: '2.75rem' }}
                    >
                      Grocery Shopping
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Food Tab Content */}
              <TabsContent value="food" className="space-y-12">
                {/* Search Bar for Food Delivery (all screens) */}
                <div className="w-full mb-4">
                  <form className="flex items-center rounded-full bg-white shadow px-3 py-2 border border-athani-200">
                    <input
                      type="search"
                      placeholder="Search for dishes or restaurants..."
                      className="flex-1 bg-transparent outline-none px-2 text-sm"
                      style={{ minWidth: 0 }}
                    />
                    <button type="submit" className="ml-2 px-3 py-1.5 bg-athani-600 text-white rounded-full text-sm font-semibold">Search</button>
                  </form>
                </div>
                {/* What's On Your Mind Section (only for Food Delivery) */}
                <WhatsOnYourMindSection
                  onCategorySelect={handleCategorySelect}
                  selectedCategory={selectedCategory}
                  dishes={dishes}
                  isLoading={dishesLoading}
                  onAddToCart={handleAddDishToCart}
                />
                {/* --- Enhanced Popular Restaurants Section (now more visually appealing & responsive) --- */}
                <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-2">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-athani-900 mb-1">Popular Restaurants</h3>
                      <p className="text-gray-600 text-base md:text-lg">Discover trending restaurants and their signature dishes</p>
                    </div>
                    <Link
                      to="/hotels"
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-athani-100 hover:bg-athani-200 text-athani-700 font-semibold text-sm md:text-base transition shadow-sm border border-athani-200"
                    >
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {dishesLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 p-4 animate-pulse">
                          <Skeleton className="w-full h-40 sm:h-48 md:h-52 mb-3" />
                          <Skeleton className="w-2/3 h-6 mb-2" />
                          <Skeleton className="w-1/2 h-4 mb-2" />
                          <Skeleton className="w-1/3 h-4 mb-2" />
                          <Skeleton className="w-full h-10" />
                        </div>
                      ))
                    ) : hotels.length === 0 ? (
                      <div className="col-span-full text-center py-12 text-gray-400 text-lg">No restaurants found.</div>
                    ) : (
                      hotels.map((hotel) => (
                        <div key={hotel.id} className="group relative flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all overflow-hidden">
                          <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden">
                            <img
                              src={hotel.image}
                              alt={hotel.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Rating Badge */}
                            <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md flex items-center text-sm font-semibold shadow">
                              <Star className="w-4 h-4 text-yellow-500 mr-1" />
                              <span className="text-athani-900">{hotel.rating ?? 'N/A'}</span>
                            </div>
                            {/* Delivery Time Badge */}
                            {hotel.deliveryTime && (
                              <div className="absolute top-3 right-3 bg-athani-600 text-white px-2 py-1 rounded-md text-xs font-medium shadow">
                                {hotel.deliveryTime}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col p-4">
                            <h3 className="text-lg font-bold text-athani-900 mb-1 truncate">{hotel.name}</h3>
                            <div className="flex items-center text-xs text-gray-500 mb-1 gap-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span className="truncate">{typeof hotel.location === 'string' ? hotel.location : hotel.location?.address || 'N/A'}</span>
                            </div>
                            <div className="text-xs text-gray-400 mb-2 truncate">{hotel.cuisine || 'N/A'}</div>
                            {/* Popular Dishes Preview */}
                            {hotel.dishes?.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {hotel.dishes.slice(0, 2).map((dish, idx) => {
  let dishImg = dish.image;
  if (dishImg && !/^https?:\/\//.test(dishImg)) {
    dishImg = `${import.meta.env.VITE_STATIC_URL || 'http://localhost:4000'}/uploads/${dishImg}`;
  }
  if (!dishImg) {
    dishImg = '/images/dishes/default.jpg';
  }
  return (
    <div key={dish.id || idx} className="flex items-center bg-gray-50 rounded px-2 py-1">
      <img
        src={dishImg}
        alt={dish.name}
        className="w-5 h-5 rounded object-cover mr-1"
      />
      <span className="text-xs text-gray-700">{dish.name}</span>
    </div>
  );
})}
                                </div>
                              </div>
                            )}
                            <Button asChild className="mt-auto w-full bg-cyan-700 hover:bg-cyan-800 text-white font-semibold rounded-lg py-2 transition">
                              <Link to={`/hotel-menu/${hotel.id}`}>View Menu</Link>
                            </Button>
                          </div>
                          {/* Responsive shadow and scale effect */}
                          <div className="absolute inset-0 pointer-events-none group-hover:ring-4 group-hover:ring-athani-200 transition"></div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Food Perfection Section */}
                <PerfectionSection
                  title="Perfect Food Experience"
                  description="Experience the finest dining with our curated selection of restaurants and dishes, delivered fresh to your doorstep."
                  bgColor="bg-gradient-to-r from-orange-50 to-red-50"
                  features={[
                    {
                      icon: "check",
                      title: "Quality Assured",
                      description: "Only the finest restaurants with highest quality standards"
                    },
                    {
                      icon: "truck",
                      title: "Hot Delivery",
                      description: "Your food arrives hot and fresh, just like from the kitchen"
                    },
                    {
                      icon: "clock",
                      title: "Quick Service",
                      description: "Fast preparation and delivery times for all your favorites"
                    },
                    {
                      icon: "shield",
                      title: "Safe & Hygienic",
                      description: "Strict hygiene protocols followed by all our restaurant partners"
                    }
                  ]}
                />
              </TabsContent>
              {/* Grocery Tab Content */}
              <TabsContent value="grocery" className="space-y-12">
                {/* Search Bar for Grocery Shopping (all screens) */}
                <div className="w-full mb-4">
                  <form
                    className="flex items-center rounded-full bg-white shadow px-3 py-2 border border-green-200"
                    onSubmit={e => { e.preventDefault(); }}
                  >
                    <input
                      type="search"
                      placeholder="Search for grocery products or stores..."
                      className="flex-1 bg-transparent outline-none px-2 text-sm"
                      style={{ minWidth: 0 }}
                      value={grocerySearch}
                      onChange={e => setGrocerySearch(e.target.value)}
                    />
                    <button type="submit" className="ml-2 px-3 py-1.5 bg-green-600 text-white rounded-full text-sm font-semibold">Search</button>
                  </form>
                </div>
                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto py-2">
                  <button
                    className={`px-4 py-2 rounded-full ${selectedGroceryCategory === '' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setSelectedGroceryCategory('')}
                  >
                    All
                  </button>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`px-4 py-2 rounded-full ${selectedGroceryCategory === cat ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => setSelectedGroceryCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Store Filter */}
                <select
                  value={selectedGroceryStore || ''}
                  onChange={e => setSelectedGroceryStore(e.target.value || null)}
                  className="border rounded px-2 py-1 mb-4"
                >
                  <option value="">All Stores</option>
                  {groceryStores.map(store => (
                    <option key={store._id} value={store._id}>{store.name}</option>
                  ))}
                </select>
                {/* Filter for available products */}
                <ProductGrid
                  products={storeInventory}
                  storeInventory={storeInventory}
                  isLoading={productsLoading}
                        addToCart={handleAddProductToCart}
                      />
                {/* Store Grid */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">Popular Stores</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {groceryStores.map(store => (
                      <StoreCard key={store._id} store={store} />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
      {/* App Promotion */}
      <section className="py-16 bg-gradient-to-r from-athani-900 to-athani-800 text-white">
        <div className="container px-4 mx-auto">
          <div className="grid items-center grid-cols-1 gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Get The Athani Mart App</h2>
              <p className="text-lg opacity-90">
                Download our app for a faster, more personalized shopping experience with exclusive offers for both food and groceries.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-athani-900">
                  Download for Android
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-athani-900">
                  Download for iOS
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative w-64 h-auto">
                <img
                  src="https://img.freepik.com/free-psd/smartphone-mockup_1310-812.jpg?w=1380&t=st=1683973999~exp=1683974599~hmac=c8b1eebed77f33a507c20cce168be2a9787d0a9c77721fd8af69606c3482dbf5"
                  alt="Athani Mart App"
                  className="object-contain w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
