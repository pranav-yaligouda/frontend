import * as React from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  availableStores?: Product[];
  onQuickView?: (product: Product) => void;
  addToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, availableStores = [], onQuickView, addToCart }) => {
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
      className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col relative group focus-within:ring-2 focus-within:ring-primary"
      tabIndex={0}
      aria-label={`Product: ${product.name}`}
      role="article"
    >
      <img
        src={product.image || 'https://media.gettyimages.com/id/1450154366/vector/podium-stands.jpg?s=612x612&w=gi&k=20&c=epU6kxl9DkuKzc5YQ03fkk3jBMzn1aB-pk7h_rO28Rg='}
        alt={product.name}
        className="rounded mb-2 h-32 object-cover w-full bg-gray-100"
        loading="lazy"
        onError={e => (e.currentTarget.src = '/images/products/default.jpg')}
      />
      {/* Available badge */}
      {availableStores.length > 0 && (
        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
          Available in {availableStores.length} store{availableStores.length > 1 ? 's' : ''}
        </span>
      )}
      {/* Other badges */}
      {product.discountPercent && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {product.discountPercent}% OFF
        </span>
      )}
      {product.isNew && (
        <span className="absolute top-10 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
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
      <Button onClick={handleQuickView} className="mb-2" aria-label={`View availability for ${product.name}`}>View Availability</Button>
      {addToCart && (
        <Button onClick={handleAddToCart} disabled={product.stock <= 0} aria-label={`Add ${product.name} to cart`}>
          {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      )}
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
