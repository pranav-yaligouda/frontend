import { useEffect, useState } from "react";
import Loader from "@/components/ui/Loader";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import type { Product as ProductType } from "@/types/product";
import { toast } from "sonner";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    // In a real app, you would fetch from an API
    if (!id) return;

    setIsLoading(true);
    const fetchProduct = () => {
      setTimeout(() => {
        const foundProduct = products.find((p) => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
        }
        setIsLoading(false);
      }, 500);
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, Math.min(product?.stockQuantity || 10, quantity + value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!product) return;

    setIsAdding(true);

    // Calculate the actual price with discount
    const price = product.discountPercent 
      ? product.price - (product.price * product.discountPercent / 100) 
      : product.price;

    // Add to cart with the calculated price
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          productId: product.id,
          name: product.name,
          price: price,
          image: product.image,
          storeId: product.storeId,
          storeName: product.storeName,
          type: "product"
        });
      }

      toast.success(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`);
      setIsAdding(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="animate-pulse">
          <div className="w-32 h-6 mb-4 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="h-64 bg-gray-200 rounded-lg md:h-96"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
          <p className="mb-6 text-gray-600">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountedPrice = product.discountPercent 
    ? product.price - (product.price * product.discountPercent / 100) 
    : null;

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link to="/" className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="overflow-hidden bg-gray-100 rounded-lg">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          
          <div className="text-sm text-gray-500">
            Category: <span className="font-medium">{product.category}</span> • From{" "}
            <Link to={`/store/${product.storeId}`} className="font-medium text-primary">
              {product.storeName}
            </Link>
          </div>

          <div className="flex items-baseline space-x-2">
            {discountedPrice ? (
              <>
                <span className="text-2xl font-bold">₹{discountedPrice.toFixed(2)}</span>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md">
                  {product.discountPercent}% OFF
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold">₹{product.price.toFixed(2)}</span>
            )}
            <span className="text-gray-500">/ {product.unit}</span>
          </div>

          {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
            <div className="text-sm text-orange-500">
              Only {product.stockQuantity} left in stock!
            </div>
          )}

          {product.stockQuantity <= 0 && (
            <div className="text-sm text-red-500 font-bold">
              Out of stock
            </div>
          )}

          <p className="text-gray-700">{product.description}</p>

          <div className="pt-4 border-t">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Quantity
            </label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || product.stockQuantity <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stockQuantity || product.stockQuantity <= 0}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToCart}
            disabled={isAdding || product.stockQuantity <= 0}
          >
            {product.stockQuantity <= 0 ? (
              "Out of Stock"
            ) : isAdding ? (
              "Adding to Cart..."
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Product;
