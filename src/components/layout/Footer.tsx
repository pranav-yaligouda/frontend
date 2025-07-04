
import { Link, useNavigate } from "react-router-dom";
import { Home, Building2, Store, Truck, ShoppingBag, ClipboardList, User } from "lucide-react";
import { useAuth, UserRole } from "@/context/AuthContext";

const MobileFooterNav = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();

  // Determine dashboard icon and route
  let dashboardIcon = <Building2 className="w-6 h-6" />;
  let dashboardLabel = "Hotels";
  let dashboardRoute = "/hotels";
  const isCustomer = hasRole([UserRole.CUSTOMER]);

  if (hasRole([UserRole.HOTEL_MANAGER])) {
    dashboardIcon = <Building2 className="w-6 h-6" />;
    dashboardLabel = "Hotel";
    dashboardRoute = "/hotel-dashboard";
  } else if (hasRole([UserRole.STORE_OWNER])) {
    dashboardIcon = <Store className="w-6 h-6" />;
    dashboardLabel = "Store";
    dashboardRoute = "/storefront";
  } else if (hasRole([UserRole.DELIVERY_AGENT])) {
    dashboardIcon = <Truck className="w-6 h-6" />;
    dashboardLabel = "Delivery";
    dashboardRoute = "/deliveries";
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg flex justify-around items-center py-2 md:hidden">
      <button
        className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none"
        onClick={() => navigate("/")}
      >
        <Home className="w-6 h-6 mb-0.5" />
        <span>Home</span>
      </button>
      <button
        className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none"
        onClick={() => navigate(dashboardRoute)}
      >
        {dashboardIcon}
        <span>{dashboardLabel}</span>
      </button>
      {isCustomer && (
        <button
          className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none"
          onClick={() => navigate("/stores")}
        >
          <Store className="w-6 h-6 mb-0.5" />
          <span>Stores</span>
        </button>
      )}
      <button
        className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none"
        onClick={() => navigate("/orders")}
      >
        <ClipboardList className="w-6 h-6 mb-0.5" />
        <span>Orders</span>
      </button>
      <button
        className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none"
        onClick={() => navigate("/profile")}
      >
        <User className="w-6 h-6 mb-0.5" />
        <span>Profile</span>
      </button>
    </nav>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <>
      {/* Desktop Footer */}
      <footer className="py-8 bg-white border-t hidden md:block">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-800">Athani Mart</h3>
              <p className="text-sm text-gray-600">
                Your local marketplace for fresh groceries and daily essentials. 
                Connecting local stores with customers for quick delivery.
              </p>
            </div>
            
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-800">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-gray-600 hover:text-primary">Home</Link>
                </li>
                <li>
                  <Link to="/categories" className="text-sm text-gray-600 hover:text-primary">Categories</Link>
                </li>
                <li>
                  <Link to="/stores" className="text-sm text-gray-600 hover:text-primary">Stores</Link>
                </li>
                <li>
                  <Link to="/offers" className="text-sm text-gray-600 hover:text-primary">Offers</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-800">For Partners</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/register-store" className="text-sm text-gray-600 hover:text-primary">Register Your Store</Link>
                </li>
                <li>
                  <Link to="/become-delivery-partner" className="text-sm text-gray-600 hover:text-primary">Become Delivery Partner</Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-800">Contact Us</h4>
              <address className="not-italic">
                <p className="text-sm text-gray-600">Athani, Karnataka</p>
                <p className="text-sm text-gray-600">Email: support@athanimart.com</p>
                <p className="text-sm text-gray-600">Phone: +91 9876543210</p>
              </address>
            </div>
          </div>
          
          <div className="pt-8 mt-8 text-sm text-center text-gray-500 border-t">
            <p>© {currentYear} Athani Mart. All rights reserved.</p>
            <div className="flex justify-center mt-2 space-x-4">
              <Link to="/terms" className="hover:text-primary">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
      {/* Mobile Footer Navigation */}
      <MobileFooterNav />
    </>
  );
};

export default Footer;
