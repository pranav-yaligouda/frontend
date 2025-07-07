import { Link } from "react-router-dom";
import type { Store } from "@/types/store";
import { MapPin, Clock, ShoppingBag } from "lucide-react";

interface StoreCardProps {
  store: Store;
}

const StoreCard = ({ store }: StoreCardProps) => {
  // Helper to normalize timings/openingHours to an array
  const getOpeningHoursArray = () => {
    if (Array.isArray(store.timings)) return store.timings;
    if (store.timings && typeof store.timings === "object") {
      return Object.entries(store.timings).map(([day, value]) => ({
        day,
        ...(typeof value === 'object' && value ? value : {})
      }));
    }
    return [];
  };

  // Get current day and check if store is open
  const getCurrentDayOpeningHours = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    const openingHoursArr = getOpeningHoursArray();
    return openingHoursArr.find(oh => oh.day === today);
  };

  const todayHours = getCurrentDayOpeningHours();
  
  // Check if store is currently open
  const isStoreOpen = () => {
    if (!todayHours) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    const [openHour, openMinutes] = todayHours.open.split(":").map(Number);
    const [closeHour, closeMinutes] = todayHours.close.split(":").map(Number);
    
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;
    const openTimeInMinutes = openHour * 60 + openMinutes;
    const closeTimeInMinutes = closeHour * 60 + closeMinutes;
    
    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
  };

  return (
    <Link to={`/store/${store._id || store._id}`}>
      <div className="overflow-hidden transition-all bg-white border rounded-lg hover:shadow-md hover:border-primary">
        <div className="relative h-40 overflow-hidden bg-gray-100">
          <img
            src={store.image}
            alt={store.name}
            className="object-cover w-full h-full"
          />
          {isStoreOpen() ? (
            <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
              Open now
            </div>
          ) : (
            <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
              Closed
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-1 text-lg font-medium text-gray-900">{store.name}</h3>
          <div className="flex items-center mb-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
            <span>{store.address}</span>
          </div>
          <div className="flex items-center mb-2 text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1 text-gray-400" />
            <span>{todayHours ? `Today: ${todayHours.open} - ${todayHours.close}` : 'Hours not available'}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {store.categories.map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs text-primary-foreground bg-primary rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;