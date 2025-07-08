import * as React from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  addToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, addToCart }) => {
  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addToCart) addToCart(product);
  };
  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col relative group focus-within:ring-2 focus-within:ring-primary"
      tabIndex={0}
      aria-label={`Product: ${product.name}`}
      role="article"
    >
      <img
        src={product.image || '/images/products/default.jpg'}
        alt={product.name}
        className="rounded mb-2 h-32 object-cover w-full bg-gray-100"
        loading="lazy"
        onError={e => (e.currentTarget.src = '/images/products/default.jpg')}
      />
      {/* Badges */}
      {product.discountPercent && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {product.discountPercent}% OFF
        </span>
      )}
      {product.isNew && (
        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
          New
        </span>
      )}
      {product.isBestseller && (
        <span className="absolute bottom-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded">
          Bestseller
        </span>
      )}
      <h3 className="font-bold text-lg mb-1 truncate" title={product.name}>{product.name}</h3>
      <div className="text-gray-500 text-sm mb-2 truncate">{product.category}</div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-primary text-xl">₹{product.price}</span>
        {product.rating && (
          <span className="flex items-center text-yellow-500" aria-label={`Rating: ${product.rating}`}>
            <Star className="w-4 h-4 mr-1" /> {product.rating}
          </span>
        )}
      </div>
      {onQuickView && (
        <Button onClick={handleQuickView} className="mb-2" aria-label={`Quick view ${product.name}`}>Quick View</Button>
      )}
      {addToCart && (
        <Button onClick={handleAddToCart} disabled={product.stock <= 0} aria-label={`Add ${product.name} to cart`}>
          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      )}
    </div>
  );
};

export default ProductCard;
