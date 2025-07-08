import React from "react";
import { useCart } from "@/context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

const StickyCartBar: React.FC = () => {
  const { items, getTotal, getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = getItemCount();
  const totalPrice = getTotal();

  // Hide on cart page
  if (location.pathname.startsWith("/cart")) return null;
  // Only show if there are items in the cart
  if (!items || items.length === 0) return null;

  return (
    <div
      className="
        fixed bottom-16 left-0 w-full z-50
        flex items-center justify-between
        bg-white shadow-lg border-t border-gray-200
        px-4 py-3
        animate-slide-up
        md:max-w-md md:mx-auto md:left-1/2 md:-translate-x-1/2 md:rounded-full md:bottom-6 md:w-auto
      "
      style={{ pointerEvents: "auto" }}
      role="region"
      aria-label="Cart summary"
    >
      <div className="flex items-center gap-2">
        <ShoppingCart className="w-6 h-6 text-athani-600" />
        <span className="font-semibold text-athani-900">
          {itemCount} item{itemCount > 1 ? "s" : ""}
        </span>
        <span className="text-gray-500">|</span>
        <span className="font-bold text-athani-700">₹{totalPrice}</span>
      </div>
      <button
        className="ml-4 px-4 py-2 rounded-full bg-athani-600 text-white font-semibold shadow hover:bg-athani-700 transition"
        onClick={() => navigate("/cart")}
        aria-label="View Cart"
      >
        View Cart
      </button>
    </div>
  );
};

export default StickyCartBar; 