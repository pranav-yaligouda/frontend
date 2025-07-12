import * as React from "react";
import { createBrowserRouter } from "react-router-dom";
import Loader from "@/components/ui/Loader";
import RequireHotelManager from "./pages/RequireHotelManager";
import { HotelProvider } from "@/context/HotelContext";

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

const router = createBrowserRouter([
  {
    path: "/",
    element: <React.Suspense fallback={<Loader />}><Index /></React.Suspense>,
  },
  {
    path: "/login",
    element: <React.Suspense fallback={<Loader />}><Login /></React.Suspense>,
  },
  {
    path: "/category/:id",
    element: <React.Suspense fallback={<Loader />}><Category /></React.Suspense>,
  },
  {
    path: "/product/:id",
    element: <React.Suspense fallback={<Loader />}><Product /></React.Suspense>,
  },
  {
    path: "/hotel-menu/:id",
    element: <React.Suspense fallback={<Loader />}><HotelMenu /></React.Suspense>,
  },
  {
    path: "/hotels",
    element: <React.Suspense fallback={<Loader />}><HotelsPage /></React.Suspense>,
  },
  {
    path: "/stores",
    element: <React.Suspense fallback={<Loader />}><StoresPage /></React.Suspense>,
  },
  {
    path: "/cart",
    element: <React.Suspense fallback={<Loader />}><Cart /></React.Suspense>,
  },
  {
    path: "/orders",
    element: <React.Suspense fallback={<Loader />}><Orders /></React.Suspense>,
  },
  {
    path: "/order/:id",
    element: <React.Suspense fallback={<Loader />}><OrderDetails /></React.Suspense>,
  },
  {
    path: "/store-dashboard",
    element: <React.Suspense fallback={<Loader />}><StoreDashboard /></React.Suspense>,
  },
  {
    path: "/hotel-dashboard",
    element: <React.Suspense fallback={<Loader />}><RequireHotelManager><HotelProvider><HotelDashboard /></HotelProvider></RequireHotelManager></React.Suspense>,
  },
  {
    path: "/deliveries",
    element: <React.Suspense fallback={<Loader />}><Deliveries /></React.Suspense>,
  },
  {
    path: "/delivery-dashboard",
    element: <React.Suspense fallback={<Loader />}><DeliveryDashboard /></React.Suspense>,
  },
  {
    path: "/profile",
    element: <React.Suspense fallback={<Loader />}><Profile /></React.Suspense>,
  },
  {
    path: "/search",
    element: <React.Suspense fallback={<Loader />}><Search /></React.Suspense>,
  },
  {
    path: "*",
    element: <React.Suspense fallback={<Loader />}><NotFound /></React.Suspense>,
  },
]);

export default router; 