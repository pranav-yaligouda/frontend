import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <BrowserRouter>
            <ScrollToTop />
            <StoreProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <React.Suspense fallback={<Loader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/category/:id" element={<Category />} />
                      <Route path="/product/:id" element={<Product />} />
                      <Route path="/hotel-menu/:id" element={<HotelMenu />} />
                      <Route path="/hotels" element={<HotelsPage />} />
                      <Route path="/stores" element={<StoresPage />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/order/:id" element={<OrderDetails />} />
                      <Route path="/store-dashboard" element={<StoreDashboard />} />
                      <Route path="/hotel-dashboard" element={
                        <RequireHotelManager>
                          <HotelProvider>
                            <HotelDashboard />
                          </HotelProvider>
                        </RequireHotelManager>
                      } />
                      <Route path="/deliveries" element={<Deliveries />} />
                      <Route path="/delivery-dashboard" element={<DeliveryDashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </React.Suspense>
                </main>
                <StickyCartBar />
                <Footer />
              </div>
            </StoreProvider>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
