import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/useCart";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Trash, Plus, Minus, ChevronLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import LocationInputWithMap from "@/components/ui/LocationInputWithMap";
// import LocationInput from "@/components/ui/locationInput"; // replaced with Google Maps version
import { toast } from "sonner";
import { createOrder, Product } from "@/data/models";
import { OrderProcessingService } from "@/api/order";

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getStores } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Address object state
  const [address, setAddress] = useState({
    addressLine: '',
    coordinates: null as { lat: number; lng: number } | null,
  });
  const [instructions, setInstructions] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');


  // Filter out invalid cart items (missing id or storeId)
  const invalidCartItems = items.filter(item => !item.id || !item.storeId);
  const validItems = items.filter(item => item.id && item.storeId);

  const storeItems = getStores().map((store) => {
    const storeProducts = validItems.filter((item) => item.storeId === store.storeId);
    const storeTotal = storeProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return { ...store, items: storeProducts, total: storeTotal };
  });

  const handleUpdateQuantity = (id: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
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
    if (invalidCartItems.length > 0) {
      toast.error('Cart contains invalid items. Please remove them before proceeding.');
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }

    // Validate address fields (new model)
    if (
      !address.addressLine ||
      !address.coordinates ||
      typeof address.coordinates.lat !== 'number' ||
      typeof address.coordinates.lng !== 'number'
    ) {
      toast.error("Please enter a complete delivery address");
      return;
    }

    setIsProcessing(true);
    try {
      for (const store of storeItems) {
        const storeProducts = store.items;
        if (storeProducts.length === 0) continue;

        const isHotel = storeProducts.some(item => item.type === 'dish');
        let pickupAddress: any = null;
        if (isHotel) {
          // Inline hotel info fetch logic
          try {
            const { getHotelById } = await import('@/api/hotelApi');
            const hotelRes = await getHotelById(store.storeId);
            if (!hotelRes || !hotelRes.success || !hotelRes.data) {
              toast.error("Could not fetch hotel info for pickup address");
              setIsProcessing(false);
              return;
            }
            const hotel = hotelRes.data;
            let city = '';
            let state = '';
            let pincode = '';
            let addressLine = hotel.location?.address || hotel.name;
            // Prefer explicit pincode field if present
            if (hotel.location?.pincode) {
              pincode = hotel.location.pincode;
            } else if (hotel.location?.address) {
              const addr = hotel.location.address;
              const parts = addr.split(',').map((s: string) => s.trim());
              if (parts.length >= 2) city = parts[parts.length - 2];
              if (parts.length >= 3) state = parts[parts.length - 1].split(' ')[0];
              // Improved: Try to extract pincode from any part
              const pinMatch = addr.match(/\b\d{6}\b/);
              if (pinMatch) pincode = pinMatch[0];
            }
            // Fallback if still not found
            if (!pincode) pincode = '560001'; // Default to Bangalore central if all else fails
            pickupAddress = {
              addressLine,
              coordinates: hotel.location?.coordinates && Array.isArray(hotel.location.coordinates)
                ? { lat: hotel.location.coordinates[1], lng: hotel.location.coordinates[0] }
                : { lat: 0, lng: 0 },
            };
          } catch (err) {
            toast.error("Error fetching hotel info for pickup address");
            setIsProcessing(false);
            return;
          }
        } else {
          // Fix: Only use store.addressLine and store.coordinates if present, fallback to storeName and default coordinates
          pickupAddress = {
            addressLine: (store as any).addressLine || store.storeName + ', Main Road',
            coordinates: (store as any).coordinates || { lat: 0, lng: 0 },
          };
        }

        const orderItems = storeProducts.map((item) => ({
          type: item.type || 'product',
          itemId: item.productId,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          storeId: item.storeId,
          storeName: item.storeName,
        }));

        const invalidItems = orderItems.filter(item => !item.itemId || !item.type);
        if (invalidItems.length > 0) {
          console.error('Invalid items:', invalidItems);
          throw new Error('Some items are missing required fields');
        }

        const orderPayload = {
          businessType: isHotel ? 'hotel' : 'store',
          businessId: store.storeId,
          customerId: user?.id,
          items: orderItems,
          paymentMethod,
          deliveryAddress: {
            addressLine: address.addressLine,
            coordinates: address.coordinates || { lat: 0, lng: 0 },
          },
          pickupAddress,
          notes: instructions,
          status: 'PLACED',
        };

        try {
          const response = await OrderProcessingService.processOrder(orderPayload);
          console.log('Order response:', response);
        } catch (error: any) {
          console.error('Order processing error:', error);
          const errorMessage = error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Failed to place order';
          if (error.response?.data?.errors) {
            const validationErrors = Object.values(error.response.data.errors)
              .map((err: any) => `• ${err.message || err}`)
              .join('\n');
            toast.error(`Validation errors:\n${validationErrors}`, {
              duration: 10000,
            });
          } else {
            toast.error(errorMessage);
          }
          throw error;
        }
      }
      clearCart();
      toast.success("Order(s) placed successfully!");
      navigate("/orders");
    } catch (error: any) {
      console.error("Order placement failed:", error);
      if (!error.handled) {
        toast.error(error.message || "Failed to place order. Please check your details and try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Accepts an address object
  const handleAddressChange = (newAddressObj: typeof address) => {
    setAddress(newAddressObj);
    setCustomerLocation(newAddressObj.coordinates || null);
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
                  <LocationInputWithMap
                    value={address}
                    onChange={handleAddressChange}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                      />
                      Cash on Delivery
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                      />
                      Online Payment
                    </label>
                  </div>
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