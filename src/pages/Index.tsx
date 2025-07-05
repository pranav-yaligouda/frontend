import { useEffect, useRef, useState } from "react";
import type { Dish } from "@/types/Dish";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductGrid from "@/components/product/ProductGrid";
import CategoryCard from "@/components/category/CategoryCard";
import StoreCard from "@/components/store/StoreCard";
import PerfectionSection from "@/components/home/PerfectionSection";
import { Product, Category, Store, categories, stores, getFeaturedProducts } from "@/data/models";
import { ChevronRight, Star, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { getAllHotels } from "@/utils/hotelApi";
import WhatsOnYourMindSection from "@/components/home/WhatsOnYourMindSection";
import HomeCategoryTabs from "@/components/home/HomeCategoryTabs";

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
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [normalizedDishes, setNormalizedDishes] = useState<Dish[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const hotelsResponse = await getAllHotels();
        let hotelsData: any[] = [];
        if (hotelsResponse && hotelsResponse.success) {
          hotelsData = Array.isArray(hotelsResponse.data) ? hotelsResponse.data : [];
        } else {
          toast.error(hotelsResponse?.error || 'Failed to fetch hotels');
          hotelsData = [];
        }
        const normalizedHotels = hotelsData.map((hotel: Hotel) => ({
          ...hotel,
          id: hotel._id || hotel.id, // Ensure 'id' is always present
        }));
        setHotels(normalizedHotels);
        // Flatten all hotel dishes into a single array, attaching hotel info
        const normalized: Dish[] = [];
        for (const hotel of hotelsData) {
          for (const hotelDish of hotel.dishes || []) {
            normalized.push({
              ...hotelDish,
              hotelName: hotel.name,
              hotelId: hotel._id || hotel.id,
              id: hotelDish._id || hotelDish.id, // ensure unique id per dish
            });
          }
        }
        setNormalizedDishes(normalized);
      } catch (error) {
        console.error("Failed to fetch hotels/dishes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const handleAddDishToCart = (dish: Dish) => {
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
      storeName: dish.hotelName
    });
    toast.success(`${dish.name} added to cart!`);
  };

  const [selectedCategory, setSelectedCategory] = useState<string>("food_delivery");
  const sectionRefs = {
    food_delivery: useRef<HTMLDivElement>(null),
    // Add more refs for other categories if needed
  };

  const handleCategorySelect = (catKey: string) => {
    setSelectedCategory(catKey);
    setTimeout(() => {
      sectionRefs[catKey]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

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
                    className="flex w-full rounded-full bg-white shadow-md border border-athani-100 p-1 gap-1 items-center justify-between"
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
                  dishes={normalizedDishes}
                  isLoading={isLoading}
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
                    {isLoading ? (
                      <div className="col-span-full text-center py-12 text-gray-400 text-lg">Loading restaurants...</div>
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
                                  {hotel.dishes.slice(0, 2).map((dish, idx) => (
                                    <div key={dish.id || idx} className="flex items-center bg-gray-50 rounded px-2 py-1">
                                      <img
                                        src={(() => {
                                          const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');
                                          return dish.image && !/^https?:\/\//.test(dish.image)
                                            ? `${apiBase}/uploads/${dish.image}`
                                            : dish.image;
                                        })()}
                                        alt={dish.name}
                                        className="w-5 h-5 rounded object-cover mr-1"
                                      />
                                      <span className="text-xs text-gray-700">{dish.name}</span>
                                    </div>
                                  ))}
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
                  <form className="flex items-center rounded-full bg-white shadow px-3 py-2 border border-green-200">
                    <input
                      type="search"
                      placeholder="Search for grocery products or stores..."
                      className="flex-1 bg-transparent outline-none px-2 text-sm"
                      style={{ minWidth: 0 }}
                    />
                    <button type="submit" className="ml-2 px-3 py-1.5 bg-green-600 text-white rounded-full text-sm font-semibold">Search</button>
                  </form>
                </div>
                {/* Categories Section */}
                <div className="bg-green-50 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Shop by Categories</h3>
                      <p className="text-gray-600">Find everything you need organized by categories</p>
                    </div>
                    <Link to="/categories" className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium">
                      View All Categories
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {categories.map((category: Category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                </div>
                {/* Featured Products */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Featured Products</h3>
                      <p className="text-gray-600">Handpicked fresh products at great prices</p>
                    </div>
                    <Link to="/products" className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium">
                      View All Products
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <ProductGrid products={featuredProducts} isLoading={isLoading} />
                </div>
                {/* Popular Stores */}
                <div className="bg-green-50 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Popular Stores</h3>
                      <p className="text-gray-600">Shop from your favorite local stores</p>
                    </div>
                    <Link to="/stores" className="flex items-center text-sm text-green-600 hover:text-green-700 font-medium">
                      View All Stores
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {stores.map((store: Store) => (
                      <StoreCard key={store.id} store={store} />
                    ))}
                  </div>
                </div>
                {/* Grocery Perfection Section */}
                <PerfectionSection
                  title="Perfect Grocery Shopping"
                  description="Get the freshest groceries and daily essentials delivered right to your home with unmatched quality and convenience."
                  bgColor="bg-gradient-to-r from-green-50 to-emerald-50"
                  features={[
                    {
                      icon: "check",
                      title: "Fresh & Quality",
                      description: "Hand-picked fresh produce and quality products every time"
                    },
                    {
                      icon: "truck",
                      title: "Express Delivery",
                      description: "Same-day delivery for all your grocery needs"
                    },
                    {
                      icon: "clock",
                      title: "24/7 Available",
                      description: "Order anytime, we're always here to serve you"
                    },
                    {
                      icon: "shield",
                      title: "Best Prices",
                      description: "Competitive pricing with regular offers and discounts"
                    }
                  ]}
                />
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
