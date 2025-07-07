
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeft,
  Clock,
  Package,
  MapPin,
  Truck,
  Calendar,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import RouteMap from "../delivery/RouteMap";

interface OrderDetailsProps {
  orderId: string;
  showMap?: boolean;
}

const OrderDetails = ({ orderId, showMap = false }: OrderDetailsProps) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        // Use orders array directly instead of getOrderById
        const orderData = orders.find(o => o.id === orderId);
        if (orderData) {
          setOrder(orderData);
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-60" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-medium mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6">
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/orders">
          <Button>View All Orders</Button>
        </Link>
      </div>
    );
  }

  // Group items by store
  const itemsByStore = order.items.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        items: []
      };
    }
    acc[item.storeId].items.push(item);
    return acc;
  }, {} as Record<string, { storeName: string, items: typeof order.items }>);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-indigo-100 text-indigo-800",
    ready: "bg-purple-100 text-purple-800",
    out_for_delivery: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    preparing: "Preparing",
    ready: "Ready for Pickup",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.substring(0, 8)}</h1>
          <p className="text-gray-500">
            Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <Badge className={`${statusColors[order.status]} py-1 px-3`}>
          {statusLabels[order.status] || order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(itemsByStore).map(([storeId, { storeName, items }], index) => (
                <div key={storeId}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <h3 className="font-medium">{storeName}</h3>
                    
                    {/* Display PIN for this store if available */}
                    {order.storePins && order.storePins[storeId] && (
                      <div className="ml-auto">
                        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          <span>PIN: {order.storePins[storeId]}</span>
                        </Badge>
                      </div>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li key={item.productId} className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.quantity} x</span>
                            <span>{item.name}</span>
                          </div>
                        </div>
                        <span className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex items-center justify-between pt-2">
                <span className="font-medium">Delivery Fee</span>
                <span className="font-medium">₹40.00</span>
              </div>
              
              <div className="flex items-center justify-between pt-2 text-lg">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold">₹{order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <span>{order.deliveryAddress}</span>
                </div>
              </div>
              
              {order.deliveryInstructions && (
                <div>
                  <p className="text-sm text-gray-500">Instructions</p>
                  <p className="mt-1 italic">{order.deliveryInstructions}</p>
                </div>
              )}
              
              {order.verificationPin && (
                <div>
                  <p className="text-sm text-gray-500">Verification PIN</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <p className="font-mono font-bold text-lg">{order.verificationPin}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This PIN must be verified by the delivery agent upon pickup
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="mt-1 font-medium">
                  {order.paymentMethod === "cash" ? "Cash on Delivery" : order.paymentMethod}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <Badge variant={order.paymentStatus === "completed" ? "secondary" : "outline"}>
                  {order.paymentStatus === "completed" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-gray-200 ms-3">
                <li className="mb-6 ms-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-primary rounded-full -start-3 ring-8 ring-white">
                    <Calendar className="w-3 h-3 text-white" />
                  </span>
                  <h3 className="font-medium">Order Placed</h3>
                  <p className="text-xs text-gray-500">
                    {format(new Date(order.createdAt), "MMM d, h:mm a")}
                  </p>
                </li>
                {order.status !== "pending" && (
                  <li className="mb-6 ms-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full -start-3 ring-8 ring-white">
                      <Package className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="font-medium">Order Confirmed</h3>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.updatedAt), "MMM d, h:mm a")}
                    </p>
                  </li>
                )}
                {["preparing", "ready", "out_for_delivery", "delivered"].includes(order.status) && (
                  <li className="mb-6 ms-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-600 rounded-full -start-3 ring-8 ring-white">
                      <Package className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="font-medium">Preparing Order</h3>
                  </li>
                )}
                {["out_for_delivery", "delivered"].includes(order.status) && (
                  <li className="mb-6 ms-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-orange-600 rounded-full -start-3 ring-8 ring-white">
                      <Truck className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="font-medium">Out for Delivery</h3>
                  </li>
                )}
                {order.status === "delivered" && (
                  <li className="ms-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-green-600 rounded-full -start-3 ring-8 ring-white">
                      <Package className="w-3 h-3 text-white" />
                    </span>
                    <h3 className="font-medium">Delivered</h3>
                  </li>
                )}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {showMap && order.optimizedRoute && (
        <div className="mt-6">
          <RouteMap order={order} />
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
