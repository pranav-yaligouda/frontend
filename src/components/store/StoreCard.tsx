import { Link } from "react-router-dom";
import type { Store } from "@/types/store";
import { MapPin, Clock, ShoppingBag } from "lucide-react";

interface StoreCardProps {
  store: Store;
}

const StoreCard = ({ store }: StoreCardProps) => {
  // Helper to normalize timings/openingHours to an array
  const getOpeningHoursArray = () => {
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
    
    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes && !todayHours.holiday;
  };

  return (
    <Link to={`/store/${store._id || store.id || ''}`} tabIndex={0} aria-label={`View store: ${store.name}`}>
      <div className="group bg-white rounded-3xl shadow-lg border border-athani-100 overflow-hidden transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl flex flex-col h-full">
        {/* Image with overlay and open/closed badge */}
        <div className="relative h-44 sm:h-52 md:h-56 w-full overflow-hidden">
          <img
            src={store.image}
            alt={store.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Floating open/closed badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow ${isStoreOpen() ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
            >
            {isStoreOpen() ? 'Open now' : 'Closed'}
          </div>
          {/* Store name and categories overlay */}
          <div className="absolute left-0 bottom-0 w-full px-4 pb-3">
            <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow mb-0 truncate">{store.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {(store.categories || []).map((category, idx) => (
                <span key={idx} className="bg-athani-600/80 text-white text-xs rounded-full px-2 py-0.5 font-medium truncate">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Info pills */}
        <div className="flex flex-col gap-2 px-4 mt-3 mb-2">
          <span className="flex items-center gap-1 bg-athani-50 text-athani-700 rounded-full px-3 py-1 text-xs font-medium truncate">
            <MapPin className="w-4 h-4" /> {store.address || store.location?.address || 'N/A'}
          </span>
          <span className="flex items-center gap-1 bg-athani-50 text-athani-700 rounded-full px-3 py-1 text-xs font-medium">
            <Clock className="w-4 h-4" />
            {todayHours ? `Today: ${todayHours.open} - ${todayHours.close}` : 'Hours not available'}
          </span>
        </div>
        {/* View Products Button */}
        <div className="px-4 pb-4 mt-auto">
          <button className="w-full rounded-full bg-athani-600 hover:bg-athani-700 text-white font-semibold py-2 text-base shadow-md mt-2 flex items-center justify-center gap-2">
            <ShoppingBag className="w-5 h-5" /> View Products
          </button>
        </div>
      </div>
    </Link>
  );
};

export default StoreCard;