import * as React from "react";
import Loader from "@/components/ui/Loader";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import OrderCard from "@/components/order/OrderCard";
import { Order, OrderStatus } from "@/types/order";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import OrderProcessingService from "@/api/order";
import { useOrders } from '@/hooks/useOrders';
import { useQueryClient } from '@tanstack/react-query';

// Toast component OUTSIDE Orders to avoid hook order issues
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '12px 24px', borderRadius: 8, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
    {message}
    <button style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={onClose}>×</button>
  </div>
);

const Orders = () => {
  const { user } = useAuth();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [status, setStatus] = React.useState<OrderStatus | 'ALL'>('ALL');
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, isError } = useOrders({ user, page, pageSize, status });
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  // WebSocket subscription for real-time updates:
  React.useEffect(() => {
    if (!user) return;
    let unsubscribed = false;
    const handleOrderUpdate = (order: Order) => {
      // Invalidate orders query to refetch latest data
      queryClient.invalidateQueries({ queryKey: ['orders', user?.role, page, pageSize, status] });
    };
    async function joinBusinessRooms() {
      if (user.role === UserRole.HOTEL_MANAGER) {
        // Fetch hotels managed by this user
        try {
          const res = await fetch(`/api/v1/hotels?manager=${user.id}`);
          const data = await res.json();
          if (!unsubscribed && data && data.success && Array.isArray(data.data)) {
            const hotelIds = data.data.map((h: any) => h._id);
            OrderProcessingService.subscribeToOrderUpdates(user.id, hotelIds, handleOrderUpdate);
          }
        } catch (err) {
          // fallback: join only user.id
          OrderProcessingService.subscribeToOrderUpdates(user.id, [user.id], handleOrderUpdate);
        }
      } else if (user.role === UserRole.STORE_OWNER) {
        // If you have a store API, fetch stores owned by this user
        // For now, fallback to user.id
        OrderProcessingService.subscribeToOrderUpdates(user.id, [user.id], handleOrderUpdate);
      } else {
        OrderProcessingService.subscribeToOrderUpdates(user.id, undefined, handleOrderUpdate);
      }
    }
    joinBusinessRooms();
    return () => {
      unsubscribed = true;
      OrderProcessingService.unsubscribeFromOrderUpdates();
    };
  }, [user, page, pageSize, status, queryClient]);

  React.useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Toast component OUTSIDE Orders to avoid hook order issues
  const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
    <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#222', color: '#fff', padding: '12px 24px', borderRadius: 8, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
      {message}
      <button style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={onClose}>×</button>
    </div>
  );

  // Early return if not logged in
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
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
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
      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <select
          className="border px-3 py-2 rounded-md"
          value={status}
          onChange={e => setStatus(e.target.value as OrderStatus | 'ALL')}
        >
          <option value="ALL">All Statuses</option>
          <option value="PLACED">Placed</option>
          <option value="ACCEPTED_BY_VENDOR">Accepted by Vendor</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY_FOR_PICKUP">Ready for Pickup</option>
          <option value="ACCEPTED_BY_AGENT">Accepted by Agent</option>
          <option value="PICKED_UP">Picked Up</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-40" />
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500">Failed to fetch orders</div>
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
          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 gap-2">
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {page} of {orders.length === 0 ? 1 : Math.ceil(orders.length / pageSize)}</span>
            <button
              className="px-3 py-1 rounded border disabled:opacity-50"
              onClick={() => setPage(p => Math.min(orders.length === 0 ? 1 : Math.ceil(orders.length / pageSize), p + 1))}
              disabled={page === orders.length === 0 ? 1 : Math.ceil(orders.length / pageSize)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
