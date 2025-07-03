
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import OrderCard from "@/components/order/OrderCard";
import { Order, getOrdersByCustomer } from "@/data/models";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await getOrdersByCustomer(user.id);
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "delivered" && order.status !== "cancelled"
  );

  const pastOrders = orders.filter(
    (order) =>
      order.status === "delivered" || order.status === "cancelled"
  );

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link to="/" className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>

      <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-40" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center">
          <h2 className="mb-2 text-xl font-medium">No Orders Yet</h2>
          <p className="mb-6 text-gray-600">
            You haven't placed any orders yet.
          </p>
          <Link to="/">
            <button className="px-4 py-2 text-white bg-primary rounded-md hover:bg-primary/90">
              Start Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {activeOrders.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-medium">Active Orders</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          {pastOrders.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-medium">Past Orders</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pastOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
