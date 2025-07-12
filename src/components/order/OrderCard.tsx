import * as React from "react";
import { Link } from "react-router-dom";
import { UserRole } from "@/context/AuthContext";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderTimeline from "./OrderTimeline";
import OrderActions from "./OrderActions";
import type { Order } from "@/types/order";

interface OrderCardProps {
  order: Order;
  userRole: UserRole;
  onAction?: (action: string, order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, userRole, onAction }) => {
  // Defensive: fallback for missing fields
  const orderId = order.id ?? order._id ?? '';
  const orderTotal = typeof order.total === 'number'
    ? order.total
    : Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      : 0;
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';

  // Responsive, modern card layout
  return (
    <div className="rounded-2xl border bg-white shadow-lg p-5 flex flex-col gap-4 h-full transition hover:shadow-xl focus-within:ring-2 focus-within:ring-athani-400/60">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-extrabold text-xl truncate text-athani-900">Order #{orderId.toString().substring(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2 sm:justify-end">
          <OrderStatusBadge status={order.status} className="ml-auto px-3 py-1 rounded-full text-xs font-semibold" />
        </div>
      </div>
      <span className="text-xs text-gray-400 -mt-2">{createdAt}</span>
      <OrderTimeline status={order.status} timestamps={order.timestamps} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-gray-700 mb-1">
          <span className="font-medium">Items:</span> {order.items.length}
        </div>
          <div className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Total:</span> ₹{orderTotal.toFixed(2)}
      </div>
        {userRole === UserRole.CUSTOMER && (
            <div className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Delivery Address:</span> {order.deliveryAddress?.addressLine ?? ''}
          </div>
        )}
        {(userRole === UserRole.HOTEL_MANAGER || userRole === UserRole.STORE_OWNER) && (
            <div className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Customer:</span> {order.customerId}
          </div>
        )}
          </div>
        <div className="flex flex-col gap-2 items-end min-w-[120px]">
          <Link
            to={`/order/${orderId}`}
            className="inline-block px-4 py-2 rounded-lg border border-athani-500 text-athani-700 font-semibold text-sm hover:bg-athani-500 hover:text-white transition text-center w-full shadow-sm"
            tabIndex={0}
            aria-label={`View details for order ${orderId}`}
          >
            View Details
        </Link>
          <OrderActions order={order} userRole={userRole} onAction={onAction} />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
