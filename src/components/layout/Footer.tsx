
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 bg-white border-t">
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
  );
};

export default Footer;
