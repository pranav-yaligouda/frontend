import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderDetailsComponent from "@/components/order/OrderDetails";
import { useAuth, UserRole } from "@/context/AuthContext";

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist.
          </p>
          <Link to="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-6">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Orders
      </Link>

      <div className="max-w-5xl mx-auto">
        <OrderDetailsComponent orderId={id} showMap={true} />
      </div>
    </div>
  );
};

export default OrderDetailsPage;
