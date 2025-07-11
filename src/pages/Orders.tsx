// frontend/src/pages/Orders.tsx
import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import OrderList from "@/components/order/OrderList";

const Orders = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
        <Link
          to="/"
          className="inline-flex items-center mb-6 text-base font-medium text-athani-700 hover:text-athani-900 focus:ring-2 focus:ring-athani-400 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
        <h1 className="mb-8 text-3xl sm:text-4xl font-bold text-athani-900">Your Orders</h1>
        <OrderList />
      </div>
    </div>
  );
};

export default Orders;