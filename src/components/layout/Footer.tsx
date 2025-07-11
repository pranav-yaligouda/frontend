
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
    dashboardRoute = "/store-dashboard";
  }

  if (!user) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center py-3 px-4 md:hidden safe-area-inset-bottom">
        <button
          className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 transition-colors"
          onClick={() => navigate("/login")}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="font-medium">Login/Register</span>
        </button>
      </nav>
    );
  }
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center py-3 px-4 md:hidden safe-area-inset-bottom">
      <button
        className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 transition-colors"
        onClick={() => navigate("/")}
      >
        <Home className="w-6 h-6 mb-1" />
        <span className="font-medium">Home</span>
      </button>
      {hasRole([UserRole.DELIVERY_AGENT]) ? (
        <>
          <button
            className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 transition-colors"
            onClick={() => navigate("/deliveries")}
            aria-label="Deliveries"
          >
            <Truck className="w-6 h-6 mb-1" />
            <span className="font-medium">Deliveries</span>
          </button>
          <button
            className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 transition-colors"
            onClick={() => navigate("/delivery-dashboard")}
            aria-label="Dashboard"
          >
            <Truck className="w-6 h-6 mb-1" />
            <span className="font-medium">Dashboard</span>
          </button>
        </>
      ) : (
        <button
          className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 transition-colors"
          onClick={() => navigate(dashboardRoute)}
          aria-label={dashboardLabel}
        >
          {dashboardIcon}
          <span className="font-medium">{dashboardLabel}</span>
        </button>
      )}
      {isCustomer && (
        <button
          className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 transition-colors"
          onClick={() => navigate("/stores")}
        >
          <Store className="w-6 h-6 mb-1" />
          <span className="font-medium">Stores</span>
        </button>
      )}
      <button
        className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 transition-colors"
        onClick={() => navigate("/orders")}
      >
        <ClipboardList className="w-6 h-6 mb-1" />
        <span className="font-medium">Orders</span>
      </button>
      <button
        className="flex flex-col items-center text-xs text-gray-700 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg p-2 transition-colors"
        onClick={() => navigate("/profile")}
      >
        <User className="w-6 h-6 mb-1" />
        <span className="font-medium">Profile</span>
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
