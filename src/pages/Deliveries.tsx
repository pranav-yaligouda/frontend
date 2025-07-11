import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Package, Check, Map, Clock, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, UserRole } from "@/context/AuthContext";
import type { Order, OrderStatus } from "@/types/order";
import { toast } from "sonner";
import RouteMap from "@/components/delivery/RouteMap";
import OrderProcessingService from "@/api/order";
import AgentStatusToggle from "@/components/delivery/AgentStatusToggle";
import PickupVerificationModal from "@/components/delivery/PickupVerificationModal";
import { useAgentProfile } from "@/hooks/useAgentProfile";

type OrderLike = Order & { _id?: string | { $oid: string }, id?: string };
function getOrderId(order: OrderLike): string {
  if ('id' in order && typeof order.id === 'string') return order.id;
  if ('_id' in order && order._id && typeof order._id === 'string') return order._id;
  if ('_id' in order && order._id && typeof order._id === 'object' && '$oid' in order._id && typeof order._id.$oid === 'string') return order._id.$oid;
  return '';
}

const Deliveries = () => {
  const { user, hasRole } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedView, setSelectedView] = useState<"list" | "map">("list");
  const [isLoading, setIsLoading] = useState(true);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [orderForPickup, setOrderForPickup] = useState<Order | null>(null);
  const { data: agent, isLoading: agentLoading, refetch: refetchAgent } = useAgentProfile();

  // Helper function to refresh orders
  const refreshOrders = async () => {
    try {
      const [availableRes, assignedRes] = await Promise.all([
        OrderProcessingService.fetchAvailableOrdersForAgent(),
        OrderProcessingService.fetchOrdersForAgent()
      ]);
      
      const availableOrders = Array.isArray(availableRes.data?.items) ? availableRes.data.items : [];
      const assignedOrders = Array.isArray(assignedRes.data?.items) ? assignedRes.data.items : [];
      
      // Combine and deduplicate orders
      const allOrders = [...availableOrders, ...assignedOrders];
      const uniqueOrders = allOrders.filter((order, index, self) => 
        index === self.findIndex(o => getOrderId(o) === getOrderId(order))
      );
      
      setOrders(uniqueOrders);
    } catch (error) {
      console.error("Failed to refresh orders:", error);
    }
  };

  // Fetch ready orders only if agent is online
  useEffect(() => {
    if (!user || !hasRole([UserRole.DELIVERY_AGENT]) || agentLoading) return;
    if (!agent?.isOnline) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    // Fetch both available orders and assigned orders
    Promise.all([
      OrderProcessingService.fetchAvailableOrdersForAgent(),
      OrderProcessingService.fetchOrdersForAgent()
    ])
      .then(([availableRes, assignedRes]) => {
        const availableOrders = Array.isArray(availableRes.data?.items) ? availableRes.data.items : [];
        const assignedOrders = Array.isArray(assignedRes.data?.items) ? assignedRes.data.items : [];
        
        // Combine and deduplicate orders
        const allOrders = [...availableOrders, ...assignedOrders];
        const uniqueOrders = allOrders.filter((order, index, self) => 
          index === self.findIndex(o => getOrderId(o) === getOrderId(order))
        );
        
        setOrders(uniqueOrders);
        setIsLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setIsLoading(false);
      });
  }, [user, hasRole, agent?.isOnline, agentLoading]);

  const handlePickupOrder = async (orderId: string) => {
    // Find the order and show PIN verification modal
    const order = orders.find(o => getOrderId(o) === orderId);
    if (order) {
      setOrderForPickup(order);
      setShowPickupModal(true);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await OrderProcessingService.updateOrderStatus(orderId, "ACCEPTED_BY_AGENT");
      await refreshOrders();
      toast.success("Order accepted successfully");
    } catch (error) {
      console.error("Failed to accept order:", error);
      toast.error("Failed to accept order");
    }
  };

  const handlePickupSuccess = async (updatedOrder: Order) => {
    await refreshOrders();
    
    // Update selected order if it's the same one
    if (selectedOrder && getOrderId(selectedOrder) === getOrderId(updatedOrder)) {
      setSelectedOrder(updatedOrder);
    }
    
    setShowPickupModal(false);
    setOrderForPickup(null);
  };

  const handleStartDelivery = async (orderId: string) => {
    try {
      await OrderProcessingService.updateOrderStatus(orderId, "OUT_FOR_DELIVERY");
      await refreshOrders();
      toast.success("Order marked as out for delivery");
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleDeliverOrder = async (orderId: string) => {
    try {
      await OrderProcessingService.updateOrderStatus(orderId, "DELIVERED");
      await refreshOrders();
      toast.success("Order delivered successfully");
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setSelectedView("map");
  };

  // Calculate estimated delivery time
  const getEstimatedDelivery = (order: Order) => {
    const now = new Date();
    
    if (order.status === "READY_FOR_PICKUP") {
      // Add 30 minutes for pickup + delivery
      const estimatedTime = new Date(now.getTime() + 30 * 60000);
      return estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // Add 15 minutes for delivery (already picked up)
      const estimatedTime = new Date(now.getTime() + 15 * 60000);
      return estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Redirect if not a delivery agent
  if (!isLoading && (!user || !hasRole([UserRole.DELIVERY_AGENT]))) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-md mx-auto text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="mb-6 text-gray-600">
            You don't have permission to view this page. Only delivery agents can access deliveries.
          </p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Deliveries</h1>
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div>
          <h2 className="text-lg font-medium">
            {orders.filter(order => order.status === "READY_FOR_PICKUP" || order.status === "ACCEPTED_BY_AGENT").length} {orders.filter(order => order.status === "READY_FOR_PICKUP" || order.status === "ACCEPTED_BY_AGENT").length === 1 ? 'Order' : 'Orders'} Assigned to You
          </h2>
          {/* Online/Offline Toggle for Delivery Agent */}
          {hasRole([UserRole.DELIVERY_AGENT]) && (
            <div className="mt-2">
              <AgentStatusToggle />
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={selectedView === "list" ? "default" : "outline"} 
            onClick={() => setSelectedView("list")}
          >
            <Package className="w-4 h-4 mr-2" /> List View
          </Button>
          <Button 
            variant={selectedView === "map" ? "default" : "outline"} 
            onClick={() => setSelectedView("map")}
            disabled={!selectedOrder}
          >
            <Map className="w-4 h-4 mr-2" /> Route View
          </Button>
        </div>
      </div>
      
      {selectedView === "map" && selectedOrder ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">
              Delivery Route for Order #{getOrderId(selectedOrder)}
            </h2>
            <Select 
              value={getOrderId(selectedOrder)} 
              onValueChange={(value) => {
                const order = orders.find(o => getOrderId(o) === value);
                if (order) setSelectedOrder(order);
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((order) => (
                  <SelectItem key={getOrderId(order)} value={getOrderId(order)}>
                    Order #{getOrderId(order)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <RouteMap order={selectedOrder} />
            </div>
            
            <div className="flex flex-col space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Order Details</CardTitle>
                  <CardDescription>
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Customer Address</p>
                      <div className="flex items-start mt-1 space-x-2">
                        <MapPin className="flex-shrink-0 mt-1 w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.deliveryAddress?.addressLine || (typeof selectedOrder.deliveryAddress === 'string' ? selectedOrder.deliveryAddress : '')}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Items</p>
                      <ul className="pl-5 mt-1 space-y-1 list-disc">
                        {selectedOrder.items.map((item, index) => (
                          <li key={index} className="text-sm">
                            {item.quantity}x {item.name} <span className="text-gray-500">from {item.storeName}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment</p>
                      <p className="mt-1">
                        {selectedOrder.paymentMethod.toUpperCase()} - {" "}
                        {selectedOrder.paymentStatus === "completed" 
                          ? "Paid" 
                          : "Collect ₹" + selectedOrder.total.toFixed(2)
                        }
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-sm font-medium">
                        Estimated delivery by {getEstimatedDelivery(selectedOrder)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {selectedOrder.status === "READY_FOR_PICKUP" && (
                    <Button onClick={() => handleAcceptOrder(getOrderId(selectedOrder))}>Accept</Button>
                  )}
                  {selectedOrder.status === "ACCEPTED_BY_AGENT" && (
                    <Button onClick={() => handlePickupOrder(getOrderId(selectedOrder))}>Verify Pickup</Button>
                  )}
                  {selectedOrder.status === "PICKED_UP" ? (
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartDelivery(getOrderId(selectedOrder))}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Start Delivery
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleDeliverOrder(getOrderId(selectedOrder))}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigation Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="pl-5 space-y-3 list-decimal">
                    {selectedOrder.optimizedRoute && typeof selectedOrder.optimizedRoute === 'object' && 'storePickups' in selectedOrder.optimizedRoute && Array.isArray(selectedOrder.optimizedRoute.storePickups) && selectedOrder.optimizedRoute.storePickups.map((store, index) => (
                      <li key={index}>
                        <p className="font-medium">Visit {store.storeName}</p>
                        <p className="text-sm text-gray-600">
                          Pick up {store.items.length} {store.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </li>
                    )) || (
                      <li>
                        <p className="font-medium">Pick up from store</p>
                        <p className="text-sm text-gray-600">
                          Pick up {selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'items'}
                        </p>
                      </li>
                    )}
                    <li>
                      <p className="font-medium">Deliver to customer</p>
                      <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress?.addressLine || (typeof selectedOrder.deliveryAddress === 'string' ? selectedOrder.deliveryAddress : '')}</p>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              <Package className="w-4 h-4 mr-2" /> Pending Pickups
            </TabsTrigger>
            <TabsTrigger value="active">
              <Navigation className="w-4 h-4 mr-2" /> Active Deliveries
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-48 bg-gray-200 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {orders
                  .filter((order) => order.status === "READY_FOR_PICKUP" || order.status === "ACCEPTED_BY_AGENT")
                  .map((order) => (
                    <Card key={getOrderId(order)}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Order #{getOrderId(order)}
                        </CardTitle>
                        <CardDescription>
                          {new Date(order.createdAt).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <h3 className="mb-2 text-sm font-medium">Stores to visit:</h3>
                          <ul className="pl-5 space-y-1 list-disc">
                            {[...new Set(order.items.map(item => item.storeName))].map(
                              (storeName, index) => (
                                <li key={index} className="text-sm">{storeName}</li>
                              )
                            )}
                          </ul>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="flex-shrink-0 mt-1 w-4 h-4 text-gray-400" />
                          <span className="text-sm">{order.deliveryAddress?.addressLine || (typeof order.deliveryAddress === 'string' ? order.deliveryAddress : '')}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => handleSelectOrder(order)}
                        >
                          <Map className="w-4 h-4 mr-2" />
                          View Route
                        </Button>
                        {order.status === "READY_FOR_PICKUP" && (
                          <Button onClick={() => handleAcceptOrder(getOrderId(order))}>Accept</Button>
                        )}
                        {order.status === "ACCEPTED_BY_AGENT" && (
                          <Button onClick={() => handlePickupOrder(getOrderId(order))}>Pick Up Order</Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}

                {orders.filter((order) => order.status === "READY_FOR_PICKUP" || order.status === "ACCEPTED_BY_AGENT").length === 0 && (
                  <div className="col-span-full py-8 text-center">
                    <h3 className="mb-2 text-lg font-medium">No Pending Pickups</h3>
                    <p className="text-gray-600">
                      There are currently no orders ready for pickup or accepted by you.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-48 bg-gray-200 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {orders
                  .filter((order) => order.status === "OUT_FOR_DELIVERY" || order.status === "PICKED_UP")
                  .map((order) => (
                    <Card key={getOrderId(order)}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Order #{getOrderId(order)}
                        </CardTitle>
                        <CardDescription>
                          {new Date(order.createdAt).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <h3 className="mb-2 text-sm font-medium">Items:</h3>
                          <ul className="pl-5 space-y-1 list-disc">
                            {order.items.map((item, index) => (
                              <li key={index} className="text-sm">
                                {item.quantity}x {item.name} from {item.storeName}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="flex-shrink-0 mt-1 w-4 h-4 text-gray-400" />
                          <span className="text-sm">{order.deliveryAddress?.addressLine || (typeof order.deliveryAddress === 'string' ? order.deliveryAddress : '')}</span>
                        </div>
                        <div className="flex items-center mt-4">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-sm">
                            Deliver by {getEstimatedDelivery(order)}
                          </span>
                        </div>
                        {order.deliveryInstructions && (
                          <div className="mt-2 text-sm italic">
                            Note: {order.deliveryInstructions}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => handleSelectOrder(order)}
                        >
                          <Map className="w-4 h-4 mr-2" />
                          View Route
                        </Button>
                        {order.status === "PICKED_UP" ? (
                          <Button
                            onClick={() => handleStartDelivery(getOrderId(order))}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Start Delivery
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleDeliverOrder(getOrderId(order))}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Delivered
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}

                {orders.filter((order) => order.status === "OUT_FOR_DELIVERY" || order.status === "PICKED_UP")
                  .length === 0 && (
                  <div className="col-span-full py-8 text-center">
                    <h3 className="mb-2 text-lg font-medium">No Active Deliveries</h3>
                    <p className="text-gray-600">
                      You don't have any orders out for delivery right now.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
      {showPickupModal && orderForPickup && (
        <PickupVerificationModal
          isOpen={showPickupModal}
          order={orderForPickup}
          onSuccess={handlePickupSuccess}
          onClose={() => setShowPickupModal(false)}
        />
      )}
    </div>
  );
};

export default Deliveries;
