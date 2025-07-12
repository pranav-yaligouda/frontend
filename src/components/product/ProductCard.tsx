import * as React from "react";
import { Button } from "@/components/ui/button";
import { Star, Plus } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  availableStores?: Product[];
  onQuickView?: (product: Product) => void;
  addToCart?: (product: Product) => void;
  increment?: (product: Product) => void;
  decrement?: (product: Product) => void;
  cartQuantity?: number;
  availableQuantity?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, availableStores = [], onQuickView, addToCart, increment, decrement, cartQuantity = 0, availableQuantity }) => {
  const [showModal, setShowModal] = React.useState(false);
  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
    setShowModal(true);
  };
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (addToCart) addToCart(product);
  };
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all p-2 flex flex-col relative group focus-within:ring-2 focus-within:ring-primary min-h-[240px] max-w-xs mx-auto w-full"
      tabIndex={0}
      aria-label={`Product: ${product.name}`}
      role="article"
      style={{ height: '320px', minHeight: '240px' }}
    >
      <div className="w-full" style={{ height: '50%' }}>
        <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center" style={{ height: '100%' }}>
          <img
            src={product.image || 'https://media.gettyimages.com/id/1450154366/vector/podium-stands.jpg?s=612x612&w=gi&k=20&c=epU6kxl9DkuKzc5YQ03fkk3jBMzn1aB-pk7h_rO28Rg='}
            alt={product.name}
            className="object-cover w-full h-full"
            loading="lazy"
            onError={e => (e.currentTarget.src = '/images/products/default.jpg')}
          />
        </div>
      </div>
      {/* Store name badge */}
      {product.storeName && (
        <span className="absolute top-2 left-2 bg-green-100 text-green-800 text-[11px] font-semibold px-2 py-0.5 rounded-full shadow border border-green-200 z-10 max-w-[70%] truncate">
          {product.storeName}
        </span>
      )}
      {/* Other badges */}
      {product.discountPercent && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
          {product.discountPercent}% OFF
        </span>
      )}
      <div className="flex flex-col justify-between flex-1 mt-1">
        <h3
          className="font-bold text-base leading-tight max-h-[2.7em] min-h-[2.1em] overflow-hidden break-words line-clamp-2 mb-0.5"
          title={product.name}
        >
          {product.name}
        </h3>
        <div className="text-gray-500 text-xs mb-0.5 truncate leading-tight max-w-full" style={{ wordBreak: 'break-word', fontSize: '11px' }}>{product.category}</div>
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-bold text-primary text-lg">₹{product.price}</span>
          {product.rating && (
            <span className="flex items-center text-yellow-500 text-xs" aria-label={`Rating: ${product.rating}`}>
              <Star className="w-3.5 h-3.5 mr-0.5" /> {product.rating}
            </span>
          )}
        </div>
        {/* Available quantity */}
        {typeof availableQuantity === 'number' && (
          <div className="text-[11px] text-gray-500 mb-1">In stock: <span className="font-semibold text-green-700">{availableQuantity}</span></div>
        )}
        <div className="flex flex-col gap-1 mt-auto w-full">
          {/* Cart controls or Add to Cart */}
          {cartQuantity > 0 && increment && decrement ? (
            <div className="flex items-center justify-center gap-1 bg-green-50 rounded-full py-0.5 px-1 mb-1 border border-green-200 w-full">
              <Button onClick={() => decrement(product)} size="icon" variant="ghost" className="text-green-700 font-bold text-base px-1 h-6 w-6 min-w-0 min-h-0" aria-label="Decrease quantity">-</Button>
              <span className="font-bold text-green-900 text-base px-1 min-w-[20px] text-center">{cartQuantity}</span>
              <Button onClick={() => increment(product)} size="icon" variant="ghost" className="text-green-700 font-bold text-base px-1 h-6 w-6 min-w-0 min-h-0" aria-label="Increase quantity" disabled={availableQuantity !== undefined && cartQuantity >= availableQuantity}>+</Button>
            </div>
          ) : addToCart && (
            <Button
              onClick={handleAddToCart}
              disabled={availableQuantity === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg py-1 text-xs flex items-center justify-center gap-1 shadow-sm transition min-h-0 min-w-0"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-4 h-4 mr-1" />
              {availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          )}
        </div>
      </div>
      {/* Modal for available stores */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative" onClick={e => e.stopPropagation()}>
            <h4 className="text-lg font-bold mb-2">Available at:</h4>
            {availableStores.length === 0 ? (
              <div className="text-gray-500">Not available in any store.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {availableStores.map((storeProd, idx) => (
                  <li key={storeProd.storeProductId || idx} className="py-2 flex flex-col">
                    <span className="font-semibold">{storeProd.storeName || 'Store'}</span>
                    <span>Price: ₹{storeProd.price}</span>
                    <span>Quantity: {storeProd.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button className="mt-4 w-full" onClick={() => setShowModal(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
