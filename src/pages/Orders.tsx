import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import OrderList from "@/components/order/OrderList";

const Orders = () => {
  return (
    <div className="container px-4 py-8 mx-auto">
      <Link to="/" className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>
      <h1 className="mb-8 text-3xl font-bold">Orders</h1>
      <OrderList />
    </div>
  );
};

export default Orders;
