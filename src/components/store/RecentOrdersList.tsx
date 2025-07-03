
import { Order } from "@/data/models";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "../order/OrderStatusBadge";
import { Shield } from "lucide-react";

interface RecentOrdersListProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
}

const RecentOrdersList = ({ orders, onViewDetails, onUpdateStatus }: RecentOrdersListProps) => {
  return (
    <div className="bg-white border rounded-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Recent Orders</h2>
      </div>
      <div className="p-4">
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className={`flex justify-between p-3 border rounded-md ${
                order.status === "pending" ? "border-yellow-300 bg-yellow-50" : ""
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">#{order.id.substring(0, 8)}</p>
                    {order.status === "pending" && (
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        New
                      </span>
                    )}
                    {order.verificationPin && (
                      <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>{order.verificationPin}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}, {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  <div className="mt-1">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <p className="text-sm font-bold">₹{order.total.toFixed(2)}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => onViewDetails(order)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No orders found
          </div>
        )}
        
        {orders.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="link">View All Orders</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentOrdersList;
