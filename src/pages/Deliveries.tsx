import * as React from "react";
import { Link } from "react-router-dom";
import { Map, Package, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import DeliveryOrderCard from "@/components/delivery/DeliveryOrderCard";
import RouteMap from "@/components/delivery/RouteMap";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import AgentStatusToggle from "@/components/delivery/AgentStatusToggle";
import io from 'socket.io-client';
import { useAgentProfile } from '@/hooks/useAgentProfile';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const Deliveries = () => {
  const { user, hasRole } = useAuth();
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [selectedView, setSelectedView] = React.useState("list");
  const { data: agent, isLoading: agentLoading } = useAgentProfile();
  const socketRef = React.useRef(null);

  // Use robust hook for fetching delivery agent orders
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useOrders({ user, status: undefined });

  React.useEffect(() => {
    if (!agent || agent.role !== 'delivery_agent') return;
    // Only connect and join room if agent is online and verified
    if (agent.isOnline && agent.verificationStatus === 'verified') {
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
      }
      const socket = socketRef.current;
      socket.emit('join', agent._id);
      socket.emit('join', 'delivery_agents_online');
      const handleOrderNew = (order) => {
        toast.info('New delivery order assigned!');
        refetch();
      };
      socket.on('order:new', handleOrderNew);
      return () => {
        socket.off('order:new', handleOrderNew);
        // Optionally, leave the room or disconnect
        // socket.emit('leave', 'delivery_agents_online');
        // socket.disconnect();
      };
    } else {
      // If agent goes offline, disconnect socket if it exists
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  }, [agent?.isOnline, agent?.verificationStatus, agent?._id, refetch]);

  // Robust status checks
  const isPending = (order) => order.status === "ACCEPTED_BY_VENDOR" || order.status === "PLACED" || order.status === "READY_FOR_PICKUP";
  const isActive = (order) => order.status === "OUT_FOR_DELIVERY";

  // Action handlers
  const handleOrderAction = async (action, order) => {
    try {
      if (action === "accept" || action === "pickup") {
        await orderServiceUpdate(order._id, "OUT_FOR_DELIVERY");
        toast.success("Order picked up successfully");
      } else if (action === "deliver") {
        await orderServiceUpdate(order._id, "DELIVERED");
      toast.success("Order delivered successfully");
      }
      refetch();
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  // Helper for updating order status
  const orderServiceUpdate = async (orderId, status) => {
    const { default: OrderProcessingService } = await import("@/api/order");
    await OrderProcessingService.updateOrderStatus(orderId, status);
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

  // Error state
  if (isError) {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <h1 className="mb-4 text-2xl font-bold">Error Loading Deliveries</h1>
        <p className="mb-6 text-gray-600">{error?.message || "An error occurred while fetching orders."}</p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    );
  }

  // Main UI
  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Deliveries</h1>
        <AgentStatusToggle />
      </div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Assigned to You
          </h2>
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
              Delivery Route for Order #{selectedOrder._id?.substring(0, 8)}
            </h2>
            <Select 
              value={selectedOrder._id} 
              onValueChange={(value) => {
                const order = orders.find(o => o._id === value);
                if (order) setSelectedOrder(order);
              }}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((order) => {
                  const orderId = order._id ?? order.id;
                  return (
                    <SelectItem key={orderId} value={orderId}>
                      Order #{orderId.toString().substring(0, 8)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <RouteMap order={selectedOrder} />
            </div>
            <div className="flex flex-col space-y-4">
              <DeliveryOrderCard order={selectedOrder} onAction={handleOrderAction} showMap={false} />
              {/* Navigation instructions, if needed, can be added here */}
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
                {orders.filter(isPending).map((order) => {
                  const orderId = order._id ?? order.id;
                  return (
                    <DeliveryOrderCard
                      key={orderId}
                      order={order}
                      onAction={handleOrderAction}
                    />
                  );
                })}
                {orders.filter(isPending).length === 0 && (
                  <div className="col-span-full py-8 text-center">
                    <h3 className="mb-2 text-lg font-medium">No Pending Pickups</h3>
                    <p className="text-gray-600">
                      There are currently no orders ready for pickup.
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
                {orders.filter(isActive).map((order) => (
                  <DeliveryOrderCard
                    key={order._id}
                    order={order}
                    onAction={handleOrderAction}
                  />
                ))}
                {orders.filter(isActive).length === 0 && (
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
    </div>
  );
};

export default Deliveries;
