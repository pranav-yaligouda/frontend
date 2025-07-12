import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from "@/context/CartContext";
import { StoreProvider } from '@/context/StoreContext';

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StickyCartBar from "@/components/cart/StickyCartBar";

import * as React from "react";
import Loader from "@/components/ui/Loader";
import RequireHotelManager from "./pages/RequireHotelManager";
import { HotelProvider } from "@/context/HotelContext";
import ScrollToTop from "@/components/ScrollToTop";

const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const Category = React.lazy(() => import("./pages/Category"));
const Product = React.lazy(() => import("./pages/Product"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Orders = React.lazy(() => import("./pages/Orders"));
const OrderDetails = React.lazy(() => import("./pages/OrderDetails"));

const StoreDashboard = React.lazy(() => import("./pages/StoreDashboard"));
const HotelDashboard = React.lazy(() => import("./pages/HotelDashboard"));
const HotelMenu = React.lazy(() => import("./pages/HotelMenu"));
const Deliveries = React.lazy(() => import("./pages/Deliveries"));
const Search = React.lazy(() => import("./pages/Search"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Profile = React.lazy(() => import("./pages/Profile"));
const DeliveryDashboard = React.lazy(() => import("./pages/DeliveryDashboard"));
const HotelsPage = React.lazy(() => import("./pages/HotelsPage"));
const StoresPage = React.lazy(() => import("./pages/StoresPage"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
