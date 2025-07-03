
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Clock } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { Store as StoreType, Product, stores, getProductsByStore } from "@/data/models";

const Store = () => {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<StoreType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get store info
        const foundStore = stores.find((s) => s.id === id) || null;
        setStore(foundStore);

        // Check if store is open
        if (foundStore) {
          const now = new Date();
          const day = now.toLocaleString("en-US", { weekday: "long" });
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          const todayHours = foundStore.openingHours.find((h) => h.day === day);
          if (todayHours) {
            const [openHour, openMinute] = todayHours.open.split(":").map(Number);
            const [closeHour, closeMinute] = todayHours.close.split(":").map(Number);
            
            const currentTimeMinutes = currentHour * 60 + currentMinute;
            const openTimeMinutes = openHour * 60 + openMinute;
            const closeTimeMinutes = closeHour * 60 + closeMinute;
            
            setIsOpen(
              currentTimeMinutes >= openTimeMinutes &&
              currentTimeMinutes <= closeTimeMinutes
            );
          }
        }

        // Get products from store
        const storeProducts = await getProductsByStore(id);
        setProducts(storeProducts);
      } catch (error) {
        console.error("Failed to fetch store data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="animate-pulse">
          <div className="w-32 h-6 mb-6 bg-gray-200 rounded"></div>
          <div className="h-64 mb-8 bg-gray-200 rounded-lg"></div>
          <div className="h-8 mb-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Store Not Found</h1>
          <p className="mb-6 text-gray-600">
            The store you are looking for does not exist or has been removed.
          </p>
          <Link to="/">
            <button className="px-4 py-2 text-white transition-colors bg-primary rounded-md hover:bg-primary/90">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link to="/" className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>

      <div className="relative mb-8 overflow-hidden bg-gray-100 rounded-lg h-72">
        <img
          src={store.image}
          alt={store.name}
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{store.name}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              isOpen ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
          <div className="flex items-center mt-2 text-sm text-white/80">
            <MapPin className="w-4 h-4 mr-2" />
            {store.address}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <div className="p-4 bg-white border rounded-lg">
          <h3 className="flex items-center mb-3 text-lg font-medium">
            <Clock className="w-5 h-5 mr-2" />
            Opening Hours
          </h3>
          <ul className="space-y-2 text-sm">
            {store.openingHours.map((hours, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{hours.day}</span>
                <span>{hours.open} - {hours.close}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-white border rounded-lg md:col-span-2">
          <h3 className="mb-3 text-lg font-medium">About</h3>
          <p className="text-sm text-gray-700">{store.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {store.categories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs text-primary-foreground bg-primary rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Products</h2>
        <ProductGrid
          products={products}
          isLoading={false}
          emptyMessage="No products available from this store"
        />
      </div>
    </div>
  );
};

export default Store;
