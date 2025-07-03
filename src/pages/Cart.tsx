import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Trash, Plus, Minus, ChevronLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import LocationInput from "@/components/ui/locationInput";
import { toast } from "sonner";
import { createOrder, Product, products } from "@/data/models";
import OrderProcessingService from "@/services/OrderProcessingService";

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getStores } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);

  const storeItems = getStores().map((store) => {
    const storeProducts = items.filter((item) => item.storeId === store.storeId);
    const storeTotal = storeProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return { ...store, items: storeProducts, total: storeTotal };
  });

  const handleUpdateQuantity = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    
    // Find the product to check stock limits
    const cartItem = items.find(item => item.id === id);
    if (!cartItem) return;
    
    const product = products.find(p => p.id === cartItem.productId);
    
    if (product && newQuantity > product.stockQuantity) {
      toast.error(`Sorry, only ${product.stockQuantity} available in stock`);
      return;
    }
    
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    if (!address) {
      toast.error("Please enter a delivery address");
      return;
    }

    setIsProcessing(true);
    try {
      // Prepare order items data
      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        storeId: item.storeId,
        storeName: item.storeName,
      }));

      // If we have customer location, try to allocate from nearby stores
      // Otherwise use the cart's current store allocations
      let finalOrderItems = orderItems;
      
      if (customerLocation) {
        try {
          // Try to allocate from optimal stores
          const cartItems = items.map(item => ({
            productId: item.productId, 
            quantity: item.quantity
          }));
          
          const allocations = await OrderProcessingService.allocateOrderItems(
            customerLocation,
            cartItems
          );
          
          // Format allocated items for order
          finalOrderItems = [];
          for (const store of allocations) {
            for (const item of store.items) {
              const cartItem = items.find(i => i.productId === item.productId);
              if (cartItem) {
                finalOrderItems.push({
                  productId: item.productId,
                  name: cartItem.name,
                  price: cartItem.price,
                  quantity: item.quantity,
                  storeId: store.storeId,
                  storeName: store.storeName,
                });
              }
            }
          }
        } catch (error) {
          console.error("Failed to allocate from optimal stores:", error);
          // Fall back to cart's current allocations
        }
      }

      // Process the order with our service
      const result = await OrderProcessingService.processOrder({
        customerId: user?.id || "",
        items: finalOrderItems,
        total: getTotal(),
        deliveryAddress: address,
        deliveryInstructions: instructions,
        customerLocation: customerLocation || undefined
      });
      
      // Clear cart and redirect
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      console.error("Failed to place order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle address change and attempt to get coordinates
  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    
    // In a real app, this would use geocoding to get coordinates
    // For now, set a mock location
    if (newAddress) {
      setCustomerLocation({ lat: 16.7200, lng: 75.0700 });
    } else {
      setCustomerLocation(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-lg mx-auto text-center">
          <div className="p-6 mb-6 bg-gray-100 rounded-full w-28 h-28 flex items-center justify-center mx-auto">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>
          <h2 className="mb-4 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-gray-600">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link to="/" className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Continue Shopping
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>

          {storeItems.map((store) => (
            <div key={store.storeId} className="p-6 mb-6 bg-white border rounded-lg shadow-sm">
              <h2 className="mb-4 text-lg font-medium">{store.storeName}</h2>

              <div className="flow-root">
                <ul className="divide-y divide-gray-200">
                  {store.items.map((item) => (
                    <li key={item.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.productId}`}>
                            <p className="font-medium text-gray-900 truncate hover:text-primary">
                              {item.name}
                            </p>
                          </Link>
                          <p className="text-sm text-gray-500 truncate">
                            From {item.storeName}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-end w-32 space-x-4">
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-4 text-lg font-medium">Order Summary</h2>
            
            {storeItems.map((store) => (
              <div key={store.storeId} className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">{store.storeName}</span>
                <span className="font-medium">₹{store.total.toFixed(2)}</span>
              </div>
            ))}
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-gray-600">Delivery Fee</span>
              <span className="font-medium">₹40.00</span>
            </div>
            
            <div className="flex items-center justify-between py-4">
              <span className="text-base font-medium">Total</span>
              <span className="text-xl font-bold">₹{(getTotal() + 40).toFixed(2)}</span>
            </div>

            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Delivery Address
                  </label>
                  <LocationInput
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="Enter your delivery address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Delivery Instructions (Optional)
                  </label>
                  <Input
                    placeholder="Any specific instructions for delivery"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isProcessing || items.length === 0}
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-center text-gray-600">
                  Please log in to complete your purchase
                </p>
                <Link to="/login">
                  <Button className="w-full">Login to Checkout</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
