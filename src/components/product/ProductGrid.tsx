
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

interface ProductGridProps {
  products: Product[]; // catalog
  storeInventory: Product[]; // from getAllStoreProducts
  isLoading?: boolean;
  emptyMessage?: string;
  showOnlyAvailable?: boolean;
  onProductClick?: (product: Product, availableStores: Product[]) => void;
  addToCart?: (product: Product) => void; // <-- Add this
}

const getProductId = (p: Product) => (p._id ? p._id.toString() : p.id);

const ProductGrid = ({
  products,
  storeInventory,
  isLoading = false,
  emptyMessage = "No products found",
  showOnlyAvailable = false,
  onProductClick,
  addToCart,
}: ProductGridProps) => {
  // Map productId to all available store inventory entries
  const inventoryMap = React.useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const inv of storeInventory) {
      const id = getProductId(inv);
      if (!map[id]) map[id] = [];
      map[id].push(inv);
    }
    return map;
  }, [storeInventory]);

  // Filter products if showOnlyAvailable is true
  const filteredProducts = showOnlyAvailable
    ? products.filter(p => inventoryMap[getProductId(p)]?.length)
    : products;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden bg-white border rounded-lg">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">{showOnlyAvailable ? "No available products found." : emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {filteredProducts.map((product) => (
        <ProductCard
          key={getProductId(product)}
          product={product}
          availableStores={inventoryMap[getProductId(product)] || []}
          onQuickView={onProductClick ? () => onProductClick(product, inventoryMap[getProductId(product)] || []) : undefined}
          addToCart={addToCart} // <-- Pass this
        />
      ))}
    </div>
  );
};

export default ProductGrid;
