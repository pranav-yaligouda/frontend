import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, PhoneCall, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, logout, isAuthenticated, hasRole } = useAuth();

  const { getItemCount } = useCart();
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Mobile menu/hamburger logic removed

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      {/* Phone Order Banner */}
      <div className="bg-primary py-1 text-white text-center text-sm flex items-center justify-center">
        <PhoneCall className="w-4 h-4 mr-1" />
        <span>Order by phone: <a href="tel:9164415704" className="font-bold hover:underline">916-441-5704</a></span>
      </div>
      
      <div className="container px-4 py-3 mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">Athani Mart</span>
          </Link>

          {/* Search Bar (desktop only) */}


          {/* Navigation Links */}
          <nav className="items-center hidden space-x-6 md:flex">
            {isAuthenticated && hasRole([UserRole.STORE_OWNER]) && (
              <Link
                to="/store-dashboard"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
              >
                My Store
              </Link>
            )}
            {isAuthenticated && hasRole([UserRole.HOTEL_MANAGER]) && (
              <Link
                to="/hotel-dashboard"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
              >
                Hotel Dashboard
              </Link>
            )}
            {isAuthenticated && hasRole([UserRole.DELIVERY_AGENT]) && (
              <>
                <Link
                  to="/deliveries"
                  className="flex items-center text-sm font-medium text-gray-700 transition-colors hover:text-primary"
                  aria-label="Deliveries"
                >
                  <Truck className="w-4 h-4 mr-1" />
                  Deliveries
                </Link>
                <Link
                  to="/delivery-dashboard"
                  className="flex items-center text-sm font-medium text-gray-700 transition-colors hover:text-primary"
                  aria-label="Dashboard"
                >
                  <Truck className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
              </>
            )}
            <Link
              to="/cart"
              className="relative text-gray-700 transition-colors hover:text-primary"
            >
              <ShoppingCart className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
                  {getItemCount()}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium">
                    {user?.name}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/orders")}
                    className="cursor-pointer"
                  >
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                    className="cursor-pointer text-destructive"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            )}
          </nav>

          {/* Mobile Cart Icon (optional for mobile, can keep or remove for consistency) */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link
              to="/cart"
              className="relative text-gray-700 transition-colors hover:text-primary"
            >
              <ShoppingCart className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
                  {getItemCount()}
                </span>
              )}
            </Link>
          </div>
        </div>


      </div>
    </header>
  );
};

export default Navbar;
