import { useState, useMemo } from "react";
import { useHotels } from "@/hooks/useHotels";
import HotelCard from "@/components/hotel/HotelCard";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";

const RATING_OPTIONS = [5, 4, 3, 2, 1];

export default function HotelsPage() {
  const { data: hotels, isLoading, isError } = useHotels();
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [minRating, setMinRating] = useState(0);

  // Extract all cuisines for filter
  const allCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    hotels.forEach(h => {
      if (h.cuisine) h.cuisine.split(",").forEach(c => cuisines.add(c.trim()));
    });
    return Array.from(cuisines).sort();
  }, [hotels]);

  // Filtered hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(search.toLowerCase()) || (hotel.cuisine || "").toLowerCase().includes(search.toLowerCase());
      const matchesCuisine = !cuisine || (hotel.cuisine || "").split(",").map((c: string) => c.trim()).includes(cuisine);
      const matchesRating = !minRating || (hotel.rating || 0) >= minRating;
      return matchesSearch && matchesCuisine && matchesRating;
    });
  }, [hotels, search, cuisine, minRating]);

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="container mx-auto px-2 sm:px-4 py-6">
        <h1 className="text-3xl font-bold mb-4 text-athani-900">All Restaurants</h1>
        {/* Modern Search & Filter Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-athani-100 mb-6 py-3 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center shadow-sm rounded-xl">
          <div className="relative w-full sm:w-1/3">
            <Input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-full pl-10 pr-4 py-2 border border-athani-200 shadow-sm focus:ring-athani-500 focus:border-athani-500 text-base"
              aria-label="Search restaurants"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-athani-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            </span>
          </div>
          {/* Cuisine Pills */}
          <div className="flex flex-wrap gap-2 overflow-x-auto max-w-full py-1">
            <button
              className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all ${!cuisine ? 'bg-athani-600 text-white border-athani-600' : 'bg-white text-athani-700 border-athani-200 hover:bg-athani-50'}`}
              onClick={() => setCuisine("")}
            >
              All Cuisines
            </button>
            {allCuisines.map(c => (
              <button
                key={c}
                className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all ${cuisine === c ? 'bg-athani-600 text-white border-athani-600' : 'bg-white text-athani-700 border-athani-200 hover:bg-athani-50'}`}
                onClick={() => setCuisine(c)}
              >
                {c}
              </button>
            ))}
          </div>
          {/* Star Rating Selector */}
          <div className="flex gap-1 items-center">
            <span className="text-sm text-athani-700 mr-2">Min Rating:</span>
            {RATING_OPTIONS.map(r => (
              <button
                key={r}
                className={`rounded-full px-2 py-1 border flex items-center gap-1 text-sm font-semibold transition-all ${minRating === r ? 'bg-yellow-400/90 text-white border-yellow-400' : 'bg-white text-yellow-600 border-yellow-200 hover:bg-yellow-50'}`}
                onClick={() => setMinRating(r === minRating ? 0 : r)}
                aria-label={`Filter by ${r} stars & up`}
              >
                <Star className="w-4 h-4" fill={minRating === r ? '#fff' : 'none'} />
                {r}
              </button>
            ))}
          </div>
        </div>
        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md h-72 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-red-600">
            <img src="/images/empty-state.svg" alt="Error" className="w-32 h-32 mb-4" aria-hidden="true"/>
            <span className="text-lg font-semibold">Failed to load restaurants.</span>
            <button onClick={() => window.location.reload()} className="mt-4 underline text-blue-600">Retry</button>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500">
            <img src="/images/empty-state.svg" alt="No results" className="w-32 h-32 mb-4" aria-hidden="true"/>
            <span className="text-lg font-semibold">No restaurants found.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredHotels.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 