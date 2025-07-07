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
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-md flex items-center">
          <Star className="w-4 h-4 text-yellow-500 mr-1" />
          <span className="text-sm font-medium">{hotel.rating ?? 'N/A'}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotel.name}</h3>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Clock className="w-4 h-4 mr-1" />
          <span className="mr-4">{hotel.deliveryTime || 'N/A'}</span>
          <MapPin className="w-4 h-4 mr-1" />
          <span>{typeof hotel.location === 'string' ? hotel.location : hotel.location?.address || 'N/A'}</span>
        </div>
        
        <p className="text-sm text-gray-500 mb-3">{hotel.cuisine || 'N/A'}</p>
        
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium text-gray-900">Popular Dishes:</h4>
          <div className="flex flex-wrap gap-2">
            {hotel.dishes.slice(0, 3).map((dish, idx) => (
              <div key={dish.id || idx} className="flex items-center bg-gray-50 rounded-md px-2 py-1">
                <img
                  src={
                    (() => {
                      const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');
                      return dish.image && !/^https?:\/\//.test(dish.image)
                        ? `${apiBase}/uploads/${dish.image}`
                        : dish.image;
                    })()
                  }
                  alt={dish.name}
                  className="w-6 h-6 rounded object-cover mr-2"
                />
                <span className="text-xs text-gray-700">{dish.name}</span>
                <span className="text-xs font-medium text-primary ml-1">₹{dish.price}</span>
              </div>
            ))}
          </div>
        </div>
        
        {(() => {
          const hotelId = hotel.id || hotel._id;
          if (!hotelId) {
            console.warn('HotelCard: No id for hotel', hotel);
            return (
              <Button disabled className="w-full">No Menu</Button>
            );
          }
          return (
            <Button asChild className="w-full">
              <Link to={`/hotel-menu/${hotelId}`}>
                View Menu
              </Link>
            </Button>
          );
        })()}

      </div>
    </div>
  );
};

export default HotelCard;
