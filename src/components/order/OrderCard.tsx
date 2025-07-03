
import { Order } from "@/data/models";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-indigo-100 text-indigo-800",
    ready: "bg-purple-100 text-purple-800",
    out_for_delivery: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy h:mm a");
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Order #{order.id.substring(0, 8)}
          </h3>
          <p className="text-xs text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge
          className={`${
            statusColors[order.status as keyof typeof statusColors]
          } font-normal`}
        >
          {order.status.replace("_", " ").charAt(0).toUpperCase() +
            order.status.replace("_", " ").slice(1)}
        </Badge>
      </div>

      <div className="mb-4 space-y-2">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.productId} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium">{item.quantity} ×</span>
              <span className="ml-2 text-sm text-gray-800">{item.name}</span>
            </div>
            <span className="text-sm font-medium">
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}

        {order.items.length > 2 && (
          <div className="text-sm text-gray-500">
            +{order.items.length - 2} more items
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Total: ₹{order.total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {order.storeIds.length > 1
              ? `From ${order.storeIds.length} stores`
              : `From ${order.items[0].storeName}`}
          </p>
        </div>
        <Link to={`/order/${order.id}`}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderCard;
