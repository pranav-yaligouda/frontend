import { useEffect, useState, useMemo } from "react";
import { getAllStores } from "@/api/storeApi";
import StoreCard from "@/components/store/StoreCard";
import { Input } from "@/components/ui/input";
import { ShoppingBag } from "lucide-react";
import type { Store as StoreBase } from "@/types/store";

// Extend Store type to allow _id for backend compatibility
interface Store extends StoreBase {
  _id?: string;
}

// Type guard for backend compatibility
function hasMongoId(store: Store): store is Store & { _id: string } {
  return typeof (store as { _id?: unknown })._id === 'string';
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showOpen, setShowOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllStores()
      .then(res => setStores(res.data.items || []))
      .catch(() => setError("Failed to fetch stores"))
      .finally(() => setLoading(false));
  }, []);

  // Extract all categories for filter
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    stores.forEach((s: Store) => {
      (s.categories || []).forEach((c: string) => cats.add(c));
    });
    return Array.from(cats).sort();
  }, [stores]);

  // Filtered stores
  const filteredStores = useMemo(() => {
    return stores.filter((store: Store) => {
      const matchesSearch = store.name.toLowerCase().includes(search.toLowerCase()) || (store.address || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || (store.categories || []).includes(category);
      // Open/closed filter
      let matchesOpen = true;
      if (showOpen) {
        // Check if store is open now
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[new Date().getDay()];
        const timings = store.timings?.[today];
        if (timings && timings.open && timings.close) {
          const now = new Date();
          const [openHour, openMin] = timings.open.split(":").map(Number);
          const [closeHour, closeMin] = timings.close.split(":").map(Number);
          const nowMins = now.getHours() * 60 + now.getMinutes();
          const openMins = openHour * 60 + openMin;
          const closeMins = closeHour * 60 + closeMin;
          matchesOpen = nowMins >= openMins && nowMins <= closeMins && !timings.holiday;
        } else {
          matchesOpen = false;
        }
      }
      return matchesSearch && matchesCategory && matchesOpen;
    });
  }, [stores, search, category, showOpen]);

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="container mx-auto px-2 sm:px-4 py-6">
        <h1 className="text-3xl font-bold mb-4 text-athani-900">All Stores</h1>
        {/* Modern Search & Filter Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-athani-100 mb-6 py-3 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center shadow-sm rounded-xl">
          <div className="relative w-full sm:w-1/3">
            <Input
              type="text"
              placeholder="Search stores or address..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-full pl-10 pr-4 py-2 border border-athani-200 shadow-sm focus:ring-athani-500 focus:border-athani-500 text-base"
              aria-label="Search stores"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-athani-400">
              <ShoppingBag className="w-5 h-5" />
            </span>
          </div>
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 overflow-x-auto max-w-full py-1">
            <button
              className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all ${!category ? 'bg-athani-600 text-white border-athani-600' : 'bg-white text-athani-700 border-athani-200 hover:bg-athani-50'}`}
              onClick={() => setCategory("")}
            >
              All Categories
            </button>
            {allCategories.map(c => (
              <button
                key={c}
                className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all ${category === c ? 'bg-athani-600 text-white border-athani-600' : 'bg-white text-athani-700 border-athani-200 hover:bg-athani-50'}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          {/* Open Now Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="open-now"
              checked={showOpen}
              onChange={e => setShowOpen(e.target.checked)}
              className="accent-athani-600 w-5 h-5 rounded-full border border-athani-200"
            />
            <label htmlFor="open-now" className="text-sm text-athani-700 font-medium select-none cursor-pointer">Open Now</label>
          </div>
        </div>
        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md h-72 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-red-600">
            <img src="/images/empty-state.svg" alt="Error" className="w-32 h-32 mb-4" aria-hidden="true"/>
            <span className="text-lg font-semibold">Failed to load stores.</span>
            <button onClick={() => window.location.reload()} className="mt-4 underline text-blue-600">Retry</button>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500">
            <img src="/images/empty-state.svg" alt="No results" className="w-32 h-32 mb-4" aria-hidden="true"/>
            <span className="text-lg font-semibold">No stores found.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {filteredStores.map((store: Store) => (
              <StoreCard key={hasMongoId(store) ? store._id : store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 