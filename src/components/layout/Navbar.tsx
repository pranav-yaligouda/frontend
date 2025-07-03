
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, PhoneCall } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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

          {/* Search Bar (hidden on mobile) */}
          <form
            onSubmit={handleSearch}
            className="items-center flex-1 hidden ml-6 md:flex"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="ml-2">
              Search
            </Button>
          </form>

          {/* Navigation Links */}
          <nav className="items-center hidden space-x-6 md:flex">
            {isAuthenticated && hasRole([UserRole.STORE_OWNER]) && (
              <Link
                to="/storefront"
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
              <Link
                to="/deliveries"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-primary"
              >
                Deliveries
              </Link>
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

          {/* Mobile Menu Button */}
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
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="pt-4 pb-3 md:hidden">
            <form
              onSubmit={handleSearch}
              className="flex items-center mb-4 space-x-2"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
            <div className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm font-medium text-gray-700">
                    Hello, {user?.name}
                  </div>
                  <Link
                    to="/profile"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {hasRole([UserRole.STORE_OWNER]) && (
                    <Link
                      to="/storefront"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Store
                    </Link>
                  )}
                  {hasRole([UserRole.HOTEL_MANAGER]) && (
                    <Link
                      to="/hotel-dashboard"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Hotel Dashboard
                    </Link>
                  )}
                  {hasRole([UserRole.DELIVERY_AGENT]) && (
                    <Link
                      to="/deliveries"
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Deliveries
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate("/");
                    }}
                    className="px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
