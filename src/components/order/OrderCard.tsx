import React from "react";
import { Link } from "react-router-dom";
import { Order } from "@/data/models";
import { UserRole } from "@/context/AuthContext";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderCardProps {
  order: Order;
  userRole: UserRole;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, userRole }) => {
  // Role-based actions (to be implemented: accept, mark as ready, deliver, etc.)
  const renderActions = () => {
    switch (userRole) {
      case UserRole.HOTEL_MANAGER:
      case UserRole.STORE_OWNER:
        if (order.status === "pending") {
          return <button className="btn-primary">Accept & Start Preparing</button>;
        }
        if (order.status === "confirmed" || order.status === "preparing") {
          return <button className="btn-secondary">Mark as Ready for Pickup</button>;
        }
        break;
      case UserRole.DELIVERY_AGENT:
        if (order.status === "ready") {
          return <button className="btn-primary">Accept Delivery</button>;
        }
        if (order.status === "out_for_delivery") {
          return <button className="btn-secondary">Mark as Picked Up</button>;
        }
        if (order.status === "delivered") {
          return <button className="btn-success">Mark as Delivered</button>;
        }
        break;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm p-4 flex flex-col justify-between h-full">
        <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">
            Order #{order.id.substring(0, 8)}
          </h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="mb-2 text-sm text-gray-600">
          Placed: {new Date(order.createdAt).toLocaleString()}
        </div>
        <div className="mb-2 text-sm">
          <span className="font-medium">Items:</span> {order.items.length}
        </div>
        <div className="mb-2 text-sm">
          <span className="font-medium">Total:</span> ₹{order.total}
      </div>
        {userRole === UserRole.CUSTOMER && (
          <div className="mb-2 text-sm">
            <span className="font-medium">Delivery Address:</span> {order.deliveryAddress}
            </div>
        )}
        {(userRole === UserRole.HOTEL_MANAGER || userRole === UserRole.STORE_OWNER) && (
          <div className="mb-2 text-sm">
            <span className="font-medium">Customer:</span> {order.customerId}
          </div>
        )}
        {userRole === UserRole.DELIVERY_AGENT && (
          <div className="mb-2 text-sm">
            <span className="font-medium">Pickup:</span> {order.storeIds?.join(", ")}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Link to={`/orders/${order.id}`} className="btn-outline w-full text-center">
            View Details
        </Link>
        {renderActions()}
      </div>
    </div>
  );
};

export default OrderCard;
