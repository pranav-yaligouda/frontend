
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth, UserRole } from "@/context/AuthContext";
import { 
  Store, 
  Product, 
  Order, 
  StoreProduct,
  getProductsByStore, 
  getOrdersByStore, 
  getStoreById,
  updateOrderStatus,
  getStoreProductsByStore,
  getProductsWithLowStock
} from "@/data/models";
import { Store as StoreIcon, Package, ShoppingBag, BarChart, Bell, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import InventoryManager from "@/components/store/InventoryManager";
import InventoryAnalytics from "@/components/store/InventoryAnalytics";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import RecentOrdersList from "@/components/store/RecentOrdersList";
import OrderNotifications from "@/components/store/OrderNotifications";

const StoreFront = () => {
  const { user, hasRole } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user || !user.storeId || !hasRole([UserRole.SHOPKEEPER])) return;

    const fetchStoreData = async () => {
      setIsLoading(true);
      try {
        // Get store info
        const storeData = await getStoreById(user.storeId);
        if (!storeData) throw new Error("Store not found");
        setStore(storeData);
        
        // Get products from store
        const storeProducts = await getProductsByStore(user.storeId);
        setProducts(storeProducts);
        
        // Get store products (inventory data)
        const storeProductsData = await getStoreProductsByStore(user.storeId);
        setStoreProducts(storeProductsData);
        
        // Get orders for store
        const storeOrders = await getOrdersByStore(user.storeId);
        setOrders(storeOrders);
        
        // Count new orders (pending status)
        const newOrdersCount = storeOrders.filter(order => order.status === "pending").length;
        setNewOrderCount(newOrdersCount);
      } catch (error) {
        console.error("Failed to fetch store data:", error);
        toast.error("Failed to load store data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
    
    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(async () => {
      try {
        const storeOrders = await getOrdersByStore(user.storeId);
        const previousNewOrderCount = orders.filter(order => order.status === "pending").length;
        const newOrdersCount = storeOrders.filter(order => order.status === "pending").length;
        
        setOrders(storeOrders);
        
        // Notify if there are new orders
        if (newOrdersCount > previousNewOrderCount) {
          const diff = newOrdersCount - previousNewOrderCount;
          toast.success(`${diff} new order${diff > 1 ? 's' : ''} received!`, {
            action: {
              label: "View",
              onClick: () => setActiveTab("orders")
            }
          });
          setNewOrderCount(newOrdersCount);
        }
      } catch (error) {
        console.error("Failed to fetch updated orders:", error);
      }
    }, 30000); // Poll every 30 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [user, hasRole]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
      
      toast.success(`Order status updated to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Redirect if not a shopkeeper
  if (!isLoading && (!user || !hasRole([UserRole.SHOPKEEPER]))) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-md mx-auto text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="mb-6 text-gray-600">
            You don't have permission to view this page. Only store owners can access the storefront.
          </p>
          <Link to="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate dashboard stats
  const activeOrdersCount = orders.filter(
    order => order.status !== "delivered" && order.status !== "cancelled"
  ).length;
  
  const lowStockCount = storeProducts.filter(
    sp => sp.stockQuantity <= sp.reorderPoint
  ).length;
  
  const totalStock = storeProducts.reduce(
    (sum, sp) => sum + sp.stockQuantity, 0
  );
  
  const totalRevenue = orders
    .filter(order => order.status !== "cancelled")
    .reduce((sum, order) => {
      // Calculate revenue only from this store's items
      const storeRevenue = order.items
        .filter(item => item.storeId === user?.storeId)
        .reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      return sum + storeRevenue;
    }, 0);

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{store?.name || 'Store Dashboard'}</h1>
          <p className="text-gray-500">Manage your store orders, inventory, and analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {newOrderCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {newOrderCount}
                </span>
              )}
            </Button>
            
            {showNotifications && (
              <OrderNotifications 
                orders={orders.filter(o => o.status === "pending")} 
                onView={(order) => {
                  viewOrderDetails(order);
                  setShowNotifications(false);
                }}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
          
          <Link to="/">
            <Button variant="ghost" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center p-6 bg-white rounded-lg shadow-sm">
              <div className="p-3 mr-4 rounded-full bg-primary-foreground">
                <StoreIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Store</p>
                <h3 className="text-xl font-medium">{store?.name}</h3>
              </div>
            </div>
            
            <div className="flex items-center p-6 bg-white rounded-lg shadow-sm">
              <div className="p-3 mr-4 rounded-full bg-blue-100">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Orders</p>
                <h3 className="text-xl font-medium">{activeOrdersCount}</h3>
              </div>
            </div>
            
            <div className="flex items-center p-6 bg-white rounded-lg shadow-sm">
              <div className="p-3 mr-4 rounded-full bg-green-100">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <h3 className="text-xl font-medium">₹{totalRevenue.toFixed(2)}</h3>
              </div>
            </div>
            
            <div className="flex items-center p-6 bg-white rounded-lg shadow-sm">
              <div className="p-3 mr-4 rounded-full bg-amber-100">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <h3 className="text-xl font-medium">{lowStockCount}</h3>
              </div>
            </div>
          </div>

          {selectedOrder ? (
            <div className="mb-6">
              <Button variant="outline" onClick={closeOrderDetails} className="mb-4">
                &larr; Back to Dashboard
              </Button>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold">Order #{selectedOrder.id.substring(0, 8)}</h2>
                    <p className="text-gray-500">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Order Items</h3>
                    <div className="space-y-4">
                      {selectedOrder.items
                        .filter(item => item.storeId === user?.storeId)
                        .map((item) => (
                          <div key={item.productId} className="flex justify-between p-3 bg-gray-50 rounded-md">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>
                          ₹{selectedOrder.items
                            .filter(item => item.storeId === user?.storeId)
                            .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">Delivery Information</h3>
                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Delivery Address</p>
                          <div className="flex items-start gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                            <span>{selectedOrder.deliveryAddress}</span>
                          </div>
                        </div>
                        
                        {selectedOrder.deliveryInstructions && (
                          <div>
                            <p className="text-sm text-gray-500">Instructions</p>
                            <p className="mt-1 italic">{selectedOrder.deliveryInstructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Display PIN for delivery agent verification */}
                    {selectedOrder.verificationPin && (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-3">Verification PIN</h3>
                        <div className="p-4 bg-blue-50 rounded-md flex items-center justify-center">
                          <span className="text-2xl font-bold tracking-wider">{selectedOrder.verificationPin}</span>
                        </div>
                        <p className="mt-2 text-sm text-center text-gray-500">
                          Share this PIN with the delivery agent for order verification
                        </p>
                      </div>
                    )}
                    
                    <h3 className="text-lg font-medium mb-3">Update Order Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.status === "pending" && (
                        <Button 
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, "confirmed")}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Confirm Order
                        </Button>
                      )}
                      {selectedOrder.status === "confirmed" && (
                        <Button 
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, "preparing")}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {selectedOrder.status === "preparing" && (
                        <Button 
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, "ready")}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Mark as Ready
                        </Button>
                      )}
                      {selectedOrder.status === "ready" && (
                        <Button 
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, "out_for_delivery")}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Out for Delivery
                        </Button>
                      )}
                      {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleUpdateOrderStatus(selectedOrder.id, "cancelled")}
                        >
                          Cancel Order
                        </Button>
                      )}
                    </div>
                    
                    {selectedOrder.optimizedRoute && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Delivery Route</h3>
                        <div className="p-4 bg-gray-50 rounded-md">
                          <p className="font-medium mb-2">Delivery Instructions for Driver:</p>
                          <ol className="list-decimal pl-5 space-y-2">
                            {selectedOrder.optimizedRoute.storePickups.map((pickup, idx) => (
                              <li key={idx}>
                                Pick up from: <span className="font-medium">{pickup.storeName}</span>
                                <div className="text-sm text-gray-600">
                                  {pickup.location.lat.toFixed(4)}, {pickup.location.lng.toFixed(4)}
                                </div>
                              </li>
                            ))}
                            <li>
                              Deliver to customer at: 
                              <div className="font-medium">{selectedOrder.optimizedRoute.customerDropoff.address}</div>
                              <div className="text-sm text-gray-600">
                                {selectedOrder.optimizedRoute.customerDropoff.location.lat.toFixed(4)}, 
                                {selectedOrder.optimizedRoute.customerDropoff.location.lng.toFixed(4)}
                              </div>
                            </li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="dashboard">
                  <BarChart className="w-4 h-4 mr-2" /> Dashboard
                </TabsTrigger>
                <TabsTrigger value="inventory">
                  <Package className="w-4 h-4 mr-2" /> Inventory
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Orders
                  {newOrderCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {newOrderCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Analytics Dashboard */}
                  <InventoryAnalytics 
                    storeId={user?.storeId || ''} 
                    products={products}
                    storeProducts={storeProducts}
                  />
                  
                  {/* Recent Orders */}
                  <RecentOrdersList 
                    orders={orders.slice(0, 5)} 
                    onViewDetails={viewOrderDetails}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="inventory" className="p-6 bg-white border rounded-lg">
                <InventoryManager 
                  storeId={user?.storeId || ''}
                  products={products}
                />
              </TabsContent>
              
              <TabsContent value="orders" className="p-6 bg-white border rounded-lg">
                <h2 className="mb-4 text-xl font-bold">Manage Orders</h2>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verification PIN</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        orders.map((order) => (
                          <TableRow key={order.id} className={order.status === "pending" ? "bg-amber-50" : ""}>
                            <TableCell className="font-medium">
                              #{order.id.substring(0, 8)}
                            </TableCell>
                            <TableCell>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {order.items
                                .filter(item => item.storeId === user?.storeId)
                                .map(item => `${item.quantity}x ${item.name}`)
                                .join(", ")}
                            </TableCell>
                            <TableCell>
                              ₹{order.items
                                .filter(item => item.storeId === user?.storeId)
                                .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                                .toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <OrderStatusBadge status={order.status} />
                            </TableCell>
                            <TableCell>
                              {order.verificationPin ? (
                                <span className="font-mono">{order.verificationPin}</span>
                              ) : (
                                "Not generated"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => viewOrderDetails(order)}
                                >
                                  View
                                </Button>
                                
                                {order.status !== "delivered" && order.status !== "cancelled" && (
                                  <>
                                    {order.status === "pending" && (
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}
                                      >
                                        Confirm
                                      </Button>
                                    )}
                                    {order.status === "confirmed" && (
                                      <Button 
                                        size="sm"
                                        onClick={() => handleUpdateOrderStatus(order.id, "preparing")}
                                      >
                                        Prepare
                                      </Button>
                                    )}
                                    {order.status === "preparing" && (
                                      <Button 
                                        size="sm"
                                        onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                                      >
                                        Ready
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
};

export default StoreFront;
