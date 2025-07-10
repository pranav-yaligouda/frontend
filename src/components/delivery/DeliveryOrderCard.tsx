import React from "react";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import OrderTimeline from "@/components/order/OrderTimeline";
import RouteMap from "@/components/delivery/RouteMap";
import { MapPin, Package, Check, Map as MapIcon } from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";

interface DeliveryOrderCardProps {
  order: Order;
  onAction: (action: 'accept' | 'pickup' | 'out_for_delivery' | 'deliver', order: Order) => void;
  showMap?: boolean;
}

const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({ order, onAction, showMap }) => {
  const orderId = order.id ?? order._id ?? '';
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : '';
  const pickup = typeof order.pickupAddress === 'string' ? order.pickupAddress : order.pickupAddress?.addressLine || 'N/A';
  const delivery = typeof order.deliveryAddress === 'string' ? order.deliveryAddress : order.deliveryAddress?.addressLine || 'N/A';
  const items = order.items.map(i => `${i.quantity}x ${i.name}`).join(", ");
  const payment = order.paymentMethod ? `${order.paymentMethod.toUpperCase()}${order.total ? ` ₹${order.total}` : ''}` : '';

  return (
    <div className="rounded-xl border bg-white shadow-md p-4 flex flex-col gap-3 h-full transition hover:shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-lg truncate">Order #{orderId.toString().substring(0, 8)}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <OrderTimeline status={order.status} timestamps={order.timestamps as Record<string, string> ?? {}} />
      <div className="flex flex-col gap-1 text-sm text-gray-700 mt-2">
        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /><span><strong>Pickup:</strong> {pickup}</span></div>
        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-600" /><span><strong>Delivery:</strong> {delivery}</span></div>
        <div><strong>Items:</strong> {items}</div>
        <div><strong>Payment:</strong> {payment}</div>
        {order.deliveryInstructions && <div className="italic text-xs text-gray-500">Note: {order.deliveryInstructions}</div>}
      </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        {(order.status === "PLACED" || order.status === "ACCEPTED_BY_VENDOR") && (
          <Button onClick={() => onAction("accept", order)}><Package className="w-4 h-4 mr-2" />Accept</Button>
        )}
        {String(order.status) === "ACCEPTED_BY_AGENT" && (
          <Button onClick={() => onAction("pickup", order)}><Package className="w-4 h-4 mr-2" />Start Pickup</Button>
        )}
        {String(order.status) === "PICKED_UP" && (
          <Button onClick={() => onAction("out_for_delivery", order)}><Check className="w-4 h-4 mr-2" />Out for Delivery</Button>
        )}
        {String(order.status) === "OUT_FOR_DELIVERY" && (
          <Button onClick={() => onAction("deliver", order)}><Check className="w-4 h-4 mr-2" />Mark as Delivered</Button>
        )}
        <Button variant="outline" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery)}`)}><MapIcon className="w-4 h-4 mr-2" />Open in Maps</Button>
      </div>
      {showMap && <div className="mt-2"><RouteMap order={order} /></div>}
      <div className="text-xs text-gray-400 mt-2">Placed: {createdAt}</div>
    </div>
  );
};

export default DeliveryOrderCard; 