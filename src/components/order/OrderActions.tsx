import * as React from "react";
import { Button } from "@/components/ui/button";
import type { Order, OrderStatus } from "@/types/order";
import { UserRole } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

interface OrderActionsProps {
  order: Order;
  userRole: UserRole;
  onAction?: (action: "accept" | "reject" | "cancel" | "preparing" | "ready_for_pickup", order: Order) => Promise<void>;
}

const OrderActions: React.FC<OrderActionsProps> = ({ order, userRole, onAction }) => {
  const [loading, setLoading] = React.useState<"accept" | "reject" | "cancel" | "preparing" | "ready_for_pickup" | null>(null);
  const [confirm, setConfirm] = React.useState<null | "cancel" | "reject" | "accept">(null);

  // Helper to handle actions with confirmation and error handling
  const handleAction = async (action: "accept" | "reject" | "cancel" | "preparing" | "ready_for_pickup") => {
    setLoading(action);
    try {
      if (action === "preparing") {
        await onAction?.("preparing", order);
        toast.success("Order marked as preparing");
      } else if (action === "ready_for_pickup") {
        await onAction?.("ready_for_pickup", order);
        toast.success("Order marked as ready for pickup");
      } else {
        await onAction?.(action, order);
        toast.success(
          action === "accept"
            ? "Order accepted successfully"
            : action === "reject"
            ? "Order rejected"
            : "Order cancelled"
        );
      }
    } catch (err) {
      const message = typeof err === 'string' ? err : (err as Error)?.message || 'Failed to update order status';
      toast.error(message);
    } finally {
      setLoading(null);
      setConfirm(null);
    }
  };

  // Only show cancel for customer if order is PLACED
  if (userRole === "customer" && order.status === "PLACED") {
    return (
      <>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setConfirm("cancel")}
          disabled={loading === "cancel"}
        >
          Cancel Order
        </Button>
        <Dialog open={confirm === "cancel"} onOpenChange={open => !open && setConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Order?</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setConfirm(null)} disabled={loading === "cancel"}>No</Button>
              <Button variant="destructive" onClick={() => handleAction("cancel") } disabled={loading === "cancel"}>Yes, Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  // Hotel/Store owner actions
  if ((userRole === "hotel_manager" || userRole === "store_owner") && order.status === "PLACED") {
    return (
      <>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setConfirm("accept")}
            disabled={loading === "accept"}
          >
            Accept
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirm("reject")}
            disabled={loading === "reject"}
          >
            Reject
          </Button>
        </div>
        <Dialog open={!!confirm} onOpenChange={open => !open && setConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirm === "accept" ? "Accept Order?" : "Reject Order?"}</DialogTitle>
              <DialogDescription>
                {confirm === "accept"
                  ? "Are you sure you want to accept this order?"
                  : "Are you sure you want to reject this order? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setConfirm(null)} disabled={loading === confirm}>No</Button>
              <Button
                variant={confirm === "accept" ? "default" : "destructive"}
                onClick={() => handleAction(confirm!)}
                disabled={loading === confirm}
              >
                Yes, {confirm === "accept" ? "Accept" : "Reject"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  // Show 'Start Packing' for hotel/store owner after accepting
  if ((userRole === "hotel_manager" || userRole === "store_owner") && order.status === "ACCEPTED_BY_VENDOR") {
    return (
      <Button size="sm" onClick={() => handleAction("preparing")} disabled={loading === "preparing"}>
        Start Packing
      </Button>
    );
  }
  // Show 'Ready for Pickup' for hotel/store owner after preparing
  if ((userRole === "hotel_manager" || userRole === "store_owner") && order.status === "PREPARING") {
    return (
      <Button size="sm" onClick={() => handleAction("ready_for_pickup")} disabled={loading === "ready_for_pickup"}>
        Ready for Pickup
      </Button>
    );
  }
  // ...other actions based on status/role (add as needed)
  return null;
};

export default OrderActions; 