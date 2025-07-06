
import { Link } from "react-router-dom";
import { Product } from "@/data/models";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const discountedPrice = product.discountPercent 
    ? product.price - (product.price * product.discountPercent / 100) 
    : null;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      // Validation: Ensure product.id and product.storeId are defined and non-empty
      if (!product.id || !product.storeId) {
        toast.error('Cannot add item to cart: Product data is invalid.');
        setIsAdding(false);
        return;
      }
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: discountedPrice || product.price,
        image: product.image,
        storeId: product.storeId,
        storeName: product.storeName,
        type: 'product',
      });
      toast.success(`Added ${product.name} to cart`);
      setIsAdding(false);
    }, 500);
  };

  return (
    <div className="overflow-hidden transition-shadow bg-white border rounded-lg hover:shadow-md">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
          {product.discountPercent && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              {product.discountPercent}% OFF
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <div className="mb-4">
          <Link to={`/product/${product.id}`}>
            <h3 className="mb-1 text-lg font-medium text-gray-900 hover:text-primary truncate">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 truncate">{product.unit}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            {discountedPrice ? (
              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-bold">₹{discountedPrice.toFixed(2)}</span>
                <span className="text-sm text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-lg font-bold">₹{product.price.toFixed(2)}</span>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding || product.stockQuantity <= 0}
            className={`text-primary hover:text-primary-foreground ${
              product.stockQuantity <= 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {product.stockQuantity <= 0 ? (
              "Out of stock"
            ) : isAdding ? (
              "Adding..."
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <span>From {product.storeName}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
