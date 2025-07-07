import * as React from "react";
import Loader from "@/components/ui/Loader";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import type { Product as ProductType } from "@/types/product";
import { getProductById } from "@/api/product";
import { toast } from "sonner";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = React.useState<ProductType | null>(null);
  const [quantity, setQuantity] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const { addItem } = useCart();

  React.useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getProductById(id)
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleQuantityChange = (value: number) => {
    if (!product) return;
    const newQuantity = Math.max(1, Math.min(product.stock, quantity + value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    setTimeout(() => {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product._id,
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          storeId: product.store,
          storeName: '',
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
        <Loader />
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
            Category: <span className="font-medium">{product.category}</span> • Store ID: <span className="font-medium">{product.store}</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold">₹{product.price.toFixed(2)}</span>
            <span className="text-gray-500">/ {product.unit}</span>
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <div className="text-sm text-orange-500">
              Only {product.stock} left in stock!
            </div>
          )}
          {product.stock <= 0 && (
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
                disabled={quantity <= 1 || product.stock <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock || product.stock <= 0}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToCart}
            disabled={isAdding || product.stock <= 0}
          >
            {product.stock <= 0 ? (
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
