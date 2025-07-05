import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import OrderCard from "@/components/order/OrderCard";
import { Order } from "@/data/models";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import OrderProcessingService from "@/services/OrderProcessingService";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    let fetchFn: Promise<Order[]>;
    if (user.role === UserRole.DELIVERY_AGENT) {
      fetchFn = OrderProcessingService.fetchAvailableOrdersForAgent();
    } else {
      fetchFn = OrderProcessingService.fetchOrdersByRole(user.role, user.id);
    }
    fetchFn
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]);
          setError("Unexpected response from server. Please try again later.");
        }
      })
      .catch((err) => setError("Failed to fetch orders"))
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const handleOrderUpdate = (order: Order) => {
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === order.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = order;
          return updated;
        } else {
          return [order, ...prev];
        }
      });
    };
    OrderProcessingService.subscribeToOrderUpdates(user.id, user.storeName || user.hotelName, handleOrderUpdate);
    return () => OrderProcessingService.unsubscribeFromOrderUpdates();
  }, [user]);

  if (!user) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <h2 className="mb-2 text-xl font-medium">Please log in to view your orders.</h2>
        <Link to="/login">
          <button className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90">
            Login
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link to="/" className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>
      <h1 className="mb-8 text-3xl font-bold">
        {user.role === UserRole.CUSTOMER && "My Orders"}
        {user.role === UserRole.HOTEL_MANAGER && "Hotel Orders"}
        {user.role === UserRole.STORE_OWNER && "Store Orders"}
        {user.role === UserRole.DELIVERY_AGENT && "Available Deliveries"}
      </h1>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-40" />
          ))}
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center">
          <h2 className="mb-2 text-xl font-medium">No Orders Yet</h2>
          <p className="mb-6 text-gray-600">
            {user.role === UserRole.CUSTOMER && "You haven't placed any orders yet."}
            {user.role === UserRole.HOTEL_MANAGER && "No orders received yet."}
            {user.role === UserRole.STORE_OWNER && "No orders received yet."}
            {user.role === UserRole.DELIVERY_AGENT && "No available deliveries yet."}
          </p>
          <Link to="/">
            <button className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90">
              {user.role === UserRole.CUSTOMER ? "Start Shopping" : "Go Home"}
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} userRole={user.role} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
