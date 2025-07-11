import * as React from "react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/order";
import { OrderProcessingService } from "@/api/order";
import { toast } from "sonner";
import PickupVerificationModal from "./PickupVerificationModal";

interface DeliveryOrderActionsProps {
  order: Order;
  onOrderUpdate: (order: Order) => void;
}

const DeliveryOrderActions: React.FC<DeliveryOrderActionsProps> = ({ order, onOrderUpdate }) => {
  const [loading, setLoading] = React.useState<string | null>(null);
  const [showPickupModal, setShowPickupModal] = React.useState(false);

  // Helper to get order ID safely
  const getOrderId = (order: Order): string => {
    return order.id || order._id || '';
  };

  // Handle accepting an order
  const handleAcceptOrder = async () => {
    const orderId = getOrderId(order);
    if (!orderId) {
      toast.error("Order ID missing, cannot accept order.");
      return;
    }

    setLoading("accept");
    try {
      const updatedOrder = await OrderProcessingService.updateOrderStatus(orderId, "ACCEPTED_BY_AGENT");
      onOrderUpdate(updatedOrder);
      toast.success("Order accepted successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to accept order';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  // Handle pickup verification
  const handlePickupSuccess = (updatedOrder: Order) => {
    onOrderUpdate(updatedOrder);
    setShowPickupModal(false);
  };

  // Handle out for delivery
  const handleOutForDelivery = async () => {
    const orderId = getOrderId(order);
    if (!orderId) {
      toast.error("Order ID missing, cannot update status.");
      return;
    }

    setLoading("out_for_delivery");
    try {
      const updatedOrder = await OrderProcessingService.updateOrderStatus(orderId, "OUT_FOR_DELIVERY");
      onOrderUpdate(updatedOrder);
      toast.success("Order marked as out for delivery");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  // Handle delivery completion
  const handleDelivered = async () => {
    const orderId = getOrderId(order);
    if (!orderId) {
      toast.error("Order ID missing, cannot update status.");
      return;
    }

    setLoading("delivered");
    try {
      const updatedOrder = await OrderProcessingService.updateOrderStatus(orderId, "DELIVERED");
      onOrderUpdate(updatedOrder);
      toast.success("Order marked as delivered");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  // Render actions based on order status
  if (order.status === "READY_FOR_PICKUP") {
    return (
      <Button 
        onClick={handleAcceptOrder} 
        disabled={loading === "accept"}
        className="w-full"
      >
        {loading === "accept" ? "Accepting..." : "Accept Order"}
      </Button>
    );
  }

  if (order.status === "ACCEPTED_BY_AGENT") {
    return (
      <>
        <Button 
          onClick={() => setShowPickupModal(true)} 
          disabled={loading === "pickup"}
          className="w-full"
        >
          Verify Pickup
        </Button>
        <PickupVerificationModal
          isOpen={showPickupModal}
          onClose={() => setShowPickupModal(false)}
          order={order}
          onSuccess={handlePickupSuccess}
        />
      </>
    );
  }

  if (order.status === "PICKED_UP") {
    return (
      <Button 
        onClick={handleOutForDelivery} 
        disabled={loading === "out_for_delivery"}
        className="w-full"
      >
        {loading === "out_for_delivery" ? "Updating..." : "Start Delivery"}
      </Button>
    );
  }

  if (order.status === "OUT_FOR_DELIVERY") {
    return (
      <Button 
        onClick={handleDelivered} 
        disabled={loading === "delivered"}
        className="w-full"
      >
        {loading === "delivered" ? "Updating..." : "Mark as Delivered"}
      </Button>
    );
  }

  return null;
};

export default DeliveryOrderActions; 