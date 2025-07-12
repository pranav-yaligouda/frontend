import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, Clock, MapPin } from "lucide-react";

interface Hotel {
  id?: string;
  _id?: string;
  name: string;
  image: string;
  rating?: number;
  deliveryTime?: string;
  cuisine?: string;
  location?: string | { address?: string; [key: string]: unknown };
  dishes: {
    id: string;
    name: string;
    price: number;
    image: string;
  }[];
}

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard = ({ hotel }: HotelCardProps) => {
  const hotelId = hotel.id || hotel._id;
  return (
    <div className="group bg-white rounded-3xl shadow-lg border border-athani-100 overflow-hidden transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl flex flex-col h-full">
      {/* Image with overlay and rating */}
      <div className="relative h-48 sm:h-56 md:h-60 w-full overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {/* Floating rating badge */}
        <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full flex items-center gap-1 shadow text-sm font-semibold">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-athani-900">{hotel.rating ?? 'N/A'}</span>
        </div>
        {/* Hotel name and cuisine overlay */}
        <div className="absolute left-0 bottom-0 w-full px-4 pb-3">
          <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow mb-0 truncate">{hotel.name}</h3>
          <div className="text-xs sm:text-sm text-white/90 truncate">{hotel.cuisine || 'N/A'}</div>
        </div>
      </div>
      {/* Info pills */}
      <div className="flex gap-2 px-4 mt-3 mb-1">
        <span className="flex items-center gap-1 bg-athani-50 text-athani-700 rounded-full px-3 py-1 text-xs font-medium">
          <Clock className="w-4 h-4" /> {hotel.deliveryTime || 'N/A'}
        </span>
        <span className="flex items-center gap-1 bg-athani-50 text-athani-700 rounded-full px-3 py-1 text-xs font-medium truncate">
          <MapPin className="w-4 h-4" />
          {typeof hotel.location === 'string' ? hotel.location : hotel.location?.address || 'N/A'}
        </span>
        </div>
      {/* Popular Dishes */}
      {hotel.dishes && hotel.dishes.length > 0 && (
        <div className="px-4 mt-2 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-athani-700">Popular:</span>
            {hotel.dishes.slice(0, 3).map((dish, idx) => (
              <span key={dish.id || idx} className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 text-xs font-medium shadow-sm">
                <img
                  src={(() => {
                      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');
                    return dish.image && !/^https?:\/.*/.test(dish.image)
                        ? `${apiBase}/uploads/${dish.image}`
                        : dish.image;
                  })()}
                  alt={dish.name}
                  className="w-5 h-5 rounded-full object-cover border border-athani-100"
                  loading="lazy"
                />
                <span className="truncate max-w-[60px]">{dish.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {/* View Menu Button */}
      <div className="px-4 pb-4 mt-auto">
        {hotelId ? (
          <Button asChild className="w-full rounded-full bg-athani-600 hover:bg-athani-700 text-white font-semibold py-2 text-base shadow-md mt-2">
            <Link to={`/hotel-menu/${hotelId}`}>View Menu</Link>
            </Button>
        ) : (
          <Button disabled className="w-full rounded-full mt-2">No Menu</Button>
        )}
      </div>
    </div>
  );
};

export default HotelCard;
