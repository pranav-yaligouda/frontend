
import React, { useRef, useEffect } from "react";
import { Order } from "@/data/models";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "../order/OrderStatusBadge";
import { X, MapPin, Shield } from "lucide-react";

interface OrderNotificationsProps {
  orders: Order[];
  onView: (order: Order) => void;
  onClose: () => void;
}

const OrderNotifications = ({ orders, onView, onClose }: OrderNotificationsProps) => {
  const notificationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={notificationRef} 
      className="absolute right-0 top-full mt-2 z-50 w-80 bg-white border rounded-lg shadow-lg"
    >
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">Live Orders</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No new orders
          </div>
        ) : (
          <div className="p-2">
            {orders.map(order => (
              <div 
                key={order.id} 
                className="p-3 hover:bg-gray-50 rounded-md cursor-pointer border-l-4 border-amber-400 mb-2"
                onClick={() => onView(order)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Order #{order.id.substring(0, 8)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                
                <p className="text-sm text-gray-600 mb-1">
                  {new Date(order.createdAt).toLocaleTimeString()} • {new Date(order.createdAt).toLocaleDateString()}
                </p>
                
                <p className="text-sm mb-2">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''} • 
                  <span className="font-medium"> ₹{order.total.toFixed(2)}</span>
                </p>
                
                {order.deliveryAddress && (
                  <div className="flex items-start gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3 mt-0.5" />
                    <span className="line-clamp-2">{order.deliveryAddress}</span>
                  </div>
                )}
                
                {order.verificationPin && (
                  <div className="flex items-center justify-between mt-2 p-1 bg-blue-50 rounded">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-blue-600" />
                      <span className="text-xs text-blue-800">Verification PIN</span>
                    </div>
                    <span className="font-mono font-bold text-blue-800">{order.verificationPin}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {orders.length > 0 && (
        <div className="border-t p-3">
          <Button variant="outline" size="sm" className="w-full" onClick={onClose}>
            Mark All as Read
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderNotifications;
