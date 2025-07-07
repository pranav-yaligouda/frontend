import * as React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/context/AuthContext";
import { useHotel } from "@/context/HotelContext";
import { Plus, UtensilsCrossed, ShoppingBag, BarChart, Eye, MapPin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { DishModal } from '@/components/hotel/DishModal';
import { HotelInfoModal } from '@/components/hotel/HotelInfoModal';
import { HotelProvider } from "@/context/HotelContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole, User } from "@/context/AuthContext";
// Hotel type inlined below for type safety and to avoid missing module errors

type Hotel = {
  id: string;
  name: string;
  address: string;
  // Add any other fields you use from Hotel here
};

// Types
interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  available: boolean;
}

interface HotelOrder {
  id: string;
  dishName: string;
  quantity: number;
  price: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
  deliveryAgent?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
  createdAt: string;
}

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Add after Hotel type:
type EditableHotel = Partial<Hotel> & {
  timings?: Record<string, { open: string; close: string; holiday: boolean }>;
  location?: { address?: string; coordinates?: [number, number] };
  image?: string;
  holidays?: string[];
  [key: string]: unknown;
};

// Only one HotelDashboard definition and export below.
const HotelDashboardInner: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { hotel, setHotel, refreshHotel, loading: hotelLoading } = useHotel();
  const [dishes, setDishes] = React.useState<Dish[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [orders, setOrders] = React.useState<HotelOrder[]>([]);
  const [isAddDishOpen, setIsAddDishOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<HotelOrder | null>(null);

  // Hotel profile state
  // Remove local hotel state, use context
  const [isHotelModalOpen, setIsHotelModalOpen] = React.useState(false);
  const [isEditHotelOpen, setIsEditHotelOpen] = React.useState(false);
  const [hotelEdit, setHotelEdit] = React.useState<EditableHotel | null>(null);
  const [newDish, setNewDish] = React.useState<Omit<Dish, 'id'>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    available: true,
  });

  // Fetch hotel profile and dishes for hotel manager
  React.useEffect(() => {
    const fetchDishes = async () => {
      if (!user || !hasRole([UserRole.HOTEL_MANAGER])) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("athani_token");
        if (!token) return;
        const api = await import("@/api/hotelApi");
        if (hotel && hotel._id) {
          const dishesData = await api.getMyDishes();
          setDishes(Array.isArray(dishesData.dishes) ? dishesData.dishes : dishesData);
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        toast({ title: 'Failed to fetch dishes', description: error?.response?.data?.message || 'An error occurred.' });
      } finally {
        setLoading(false);
      }
    };
    fetchDishes();
  }, [user, hasRole, hotel]);

  const handleAddDish = async (formData: FormData) => {
  try {
    const token = localStorage.getItem("athani_token");
    if (!token) throw new Error("Not authenticated");
    const { addDish, getMyDishes } = await import("@/api/hotelApi");
    await addDish(formData);
    const updated = await getMyDishes();
    setDishes(Array.isArray(updated.dishes) ? updated.dishes : updated);
    setIsAddDishOpen(false);
    toast({ title: 'Dish added successfully!', description: 'Your dish is now available.' });
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } };
    toast({ title: 'Failed to add dish', description: error?.response?.data?.message || 'An error occurred.' });
  }
};

  const handleUpdateOrderStatus = (orderId: string, newStatus: HotelOrder["status"]) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast({ title: 'Order status updated', description: `Order status updated to ${newStatus.replace("_", " ")}` });
  };

  const toggleDishAvailability = (dishId: string) => {
    setDishes(dishes.map(dish =>
      dish.id === dishId ? { ...dish, available: !dish.available } : dish
    ));
    toast({ title: 'Dish availability updated' });
  };

  // Redirect if not a hotel manager
  if (!user || !hasRole([UserRole.HOTEL_MANAGER])) {
    return <div className="flex flex-col items-center justify-center h-[60vh]">
      <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
      <p>You do not have permission to access this page.</p>
    </div>;
  }
  if (loading || hotelLoading) return <div className="flex items-center justify-center h-[60vh]">Loading...</div>;

  // Improved check: Only show modal if required fields are missing or incomplete
  function isHotelInfoIncomplete(hotel: unknown): boolean {
    if (!hotel || typeof hotel !== 'object' || hotel === null) return true;
    const hotelObj = hotel as { name?: string; location?: { coordinates?: unknown[]; address?: string }; timings?: Record<string, unknown> };
    if (!hotelObj.name || typeof hotelObj.name !== 'string' || hotelObj.name.trim().length === 0) return true;
    // Location must exist and have valid coordinates and address
    if (!hotelObj.location ||
        !Array.isArray(hotelObj.location.coordinates) ||
        hotelObj.location.coordinates.length < 2 ||
        typeof hotelObj.location.coordinates[0] !== 'number' ||
        typeof hotelObj.location.coordinates[1] !== 'number' ||
        !hotelObj.location.address || hotelObj.location.address.trim().length === 0) {
      return true;
    }
    // Timings must exist and have all 7 days
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    if (!hotelObj.timings || typeof hotelObj.timings !== 'object') return true;
    for (const day of weekdays) {
      const t = hotelObj.timings[day] as { open?: string; close?: string; holiday?: boolean } | undefined;
      if (!t || typeof t.open !== 'string' || typeof t.close !== 'string' || typeof t.holiday !== 'boolean') {
        return true;
      }
    }
    // All required info present
    return false;
  }

  if (isHotelInfoIncomplete(hotel)) {
    return (
      <HotelInfoModal
        open={true}
        initial={hotel ? {
          name: hotel.name,
          image: hotel.image,
          address: hotel.location?.address || '',
          location: (hotel.location && Array.isArray(hotel.location.coordinates) && hotel.location.coordinates.length >= 2)
            ? { lat: hotel.location.coordinates[1], lng: hotel.location.coordinates[0], address: hotel.location.address || '' }
            : { lat: 12.9716, lng: 77.5946, address: hotel.location?.address || '' },
          timings: hotel.timings,
          holidays: hotel.holidays,
        } : undefined}
        loading={loading}
        onSubmit={async (formData) => {
          try {
            const token = localStorage.getItem('athani_token');
            if (!token) throw new Error('Not authenticated');
            const api = await import('@/api/hotelApi');
            await api.updateMyHotel(formData);
            await refreshHotel();
            toast({ title: 'Hotel info saved', description: 'Your hotel profile has been updated.' });
          } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast({ title: 'Failed to save hotel info', description: error?.response?.data?.message || 'An error occurred.', });
          }
        }}
      />
    );
  }

  // Loading state
  if (loading) return <div className="container py-8">Loading...</div>;

  // Hotel profile section
  const handleHotelEditChange = (field: keyof EditableHotel, value: unknown) => {
    setHotelEdit(prev => prev ? { ...prev, [field]: value } : { [field]: value });
  };

  const handleTimingChange = (day: string, key: string, value: unknown) => {
    setHotelEdit(prev => prev ? {
      ...prev,
      timings: {
        ...(prev.timings || {}),
        [day]: {
          ...(prev.timings?.[day] || {}),
          [key]: value,
        },
      },
    } : {
      timings: {
        [day]: { [key]: value }
      }
    });
  };

  // If you want to support map picking, add a mapCoords state below. Remove setMapCoords if not used.
  // const [mapCoords, setMapCoords] = useState<[number, number] | null>(null);
  // const handleMapClick = (e: any) => {
  //   const lat = e.latlng.lat;
  //   const lng = e.latlng.lng;
  //   setMapCoords([lng, lat]);
  //   setHotelEdit((prev: any) => ({
  //     ...prev,
  //     location: {
  //       ...prev.location,
  //       coordinates: [lng, lat],
  //     },
  //   }));
  // };

  const handleSaveHotel = async () => {
    try {
      const token = localStorage.getItem("athani_token");
      if (!token) throw new Error("Not authenticated");
      const { updateMyHotel, getMyHotel } = await import("@/api/hotelApi");
      await updateMyHotel(hotelEdit);
      const refreshed = await getMyHotel();
      setHotel(refreshed);
      setHotelEdit(refreshed);
      setIsEditHotelOpen(false);
      toast({ title: 'Hotel profile updated!' });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({ title: 'Failed to update hotel', description: error?.response?.data?.message || "Failed to update hotel" });
    }
  };

  const activeOrdersCount = orders.filter(order =>
    order.status !== "delivered" && order.status !== "cancelled"
  ).length;

  const totalRevenue = orders
    .filter(order => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.price, 0);

  return (
    <div className="container px-4 py-8 mx-auto">
      {/* Hotel Profile Card */}
      {hotel && (
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center gap-4">
              <img
                src={hotel.image || "/hotel-default.png"}
                alt={hotel.name}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  {hotel.name}
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => {
                      if (hotel) setHotelEdit(hotel);
                      setIsEditHotelOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                {/* <div className="text-sm text-muted-foreground">{hotel.description}</div> */}
              </div>
            </div>
          </div>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2 font-semibold">Timings</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {WEEKDAYS.map((day, index) => (
                    <div
                      key={`timing-${index}`}
                      className="flex justify-between items-center rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 mb-1 shadow-sm"
                    >
                      <span className="font-medium w-24 text-gray-700 dark:text-gray-200 text-sm flex-shrink-0">{day}</span>
                      {hotel.timings && hotel.timings[day] ? (
                        hotel.timings[day].holiday ? (
                          <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded">Holiday</span>
                        ) : (
                          <span className="flex gap-1 text-xs font-mono text-green-700 dark:text-green-300">
                            <span className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded">{hotel.timings[day].open}</span>
                            <span>-</span>
                            <span className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded">{hotel.timings[day].close}</span>
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 text-xs">Not set</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 font-semibold">Location</div>
                {hotel.location?.coordinates ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hotel.location.address || `${hotel.location.coordinates[1]}, ${hotel.location.coordinates[0]}`}</span>
                  </div>
                ) : <span className="text-gray-400">Not set</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Hotel Modal */}

      <Dialog open={isEditHotelOpen} onOpenChange={setIsEditHotelOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Hotel Profile</DialogTitle>
          </DialogHeader>
          {hotelEdit && (
            <div className="space-y-4 overflow-y-auto max-h-[80vh]">
              <div>
                <Label>Hotel Name</Label>
                <Input value={hotelEdit.name || ""} onChange={e => handleHotelEditChange("name", e.target.value)} />
              </div>
              <div>
                <Label>Hotel Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 4 * 1024 * 1024) {
                      toast({ title: 'Image too large', description: 'Max size is 4MB.' });
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      handleHotelEditChange("image", reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {hotelEdit.image && (
                  <img src={hotelEdit.image} alt="Hotel preview" className="mt-2 w-32 h-32 object-cover rounded border" />
                )}
              </div>
              <div>
                <Label>Address</Label>
                <Input value={hotelEdit.location?.address || ""} onChange={e => handleHotelEditChange("location", { ...hotelEdit.location, address: e.target.value })} placeholder="Hotel address" />
              </div>
              <div>
                <Label>Location (pick on map)</Label>
                <div style={{ height: 200, width: '100%' }} className="mb-2 rounded overflow-hidden border">
                  {/* Use react-leaflet for OpenStreetMap. Install: npm install leaflet react-leaflet */}
                  {/* This is a placeholder. Replace with <MapContainer ...><Marker ... /></MapContainer> in real app */}
                  <div style={{ height: 200, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="text-gray-400">[Map Picker Here]</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">Lat: {hotelEdit.location?.coordinates?.[1] || '--'} | Lng: {hotelEdit.location?.coordinates?.[0] || '--'}</div>
              </div>
              <div>
                <Label>Timings</Label>
                <div className="grid grid-cols-1 gap-2">
                  {WEEKDAYS.map(day => (
                    <div key={`edit-timing-${day}`} className="flex items-center gap-2">
                      <span className="w-20">{day}</span>
                      <Input
                        type="time"
                        value={hotelEdit.timings?.[day]?.open || ""}
                        onChange={e => handleTimingChange(day, "open", e.target.value)}
                        disabled={hotelEdit.timings?.[day]?.holiday}
                        className="w-24"
                        placeholder="Open"
                      />
                      <Input
                        type="time"
                        value={hotelEdit.timings?.[day]?.close || ""}
                        onChange={e => handleTimingChange(day, "close", e.target.value)}
                        disabled={hotelEdit.timings?.[day]?.holiday}
                        className="w-24"
                        placeholder="Close"
                      />
                      <Label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={!!hotelEdit.timings?.[day]?.holiday}
                          onChange={e => handleTimingChange(day, "holiday", e.target.checked)}
                        />
                        Holiday
                      </Label>
                    </div>
                  ))} 
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditHotelOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveHotel}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hotel Dashboard</h1>
          <p className="text-gray-500">Manage your dishes, orders, and deliveries</p>
        </div>
        <Link to="/">
          <Button variant="ghost" size="sm">
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dishes</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dishes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrdersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Dishes</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(dishes) ? dishes.filter(dish => dish.available).length : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dishes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dishes">Manage Dishes</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="dishes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Your Dishes</h2>
            <Dialog open={isAddDishOpen} onOpenChange={setIsAddDishOpen}>
  <DialogTrigger asChild>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add New Dish
    </Button>
  </DialogTrigger>
  <DishModal
    open={isAddDishOpen}
    loading={loading}
    onClose={() => setIsAddDishOpen(false)}
    onSubmit={async (formData) => {
      setLoading(true);
      try {
        await handleAddDish(formData);
      } finally {
        setLoading(false);
      }
    }}
  />
</Dialog>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dishes.map((dish, idx) => (
              <Card key={`dish-${dish.id ?? idx}`}>
                <CardHeader>
                  <img
                    src={(() => {
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/api\/v1$/, '');
  return dish.image && !/^https?:\/\//.test(dish.image)
    ? `${apiBase}/uploads/${dish.image}`
    : dish.image || "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80";
})()}
                    alt={dish.name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2">{dish.name}</CardTitle>
                  <CardDescription className="mb-2">{dish.description}</CardDescription>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">₹{dish.price}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      dish.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {dish.available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleDishAvailability(dish.id)}
                    className="w-full"
                  >
                    {dish.available ? 'Mark Unavailable' : 'Mark Available'}
                  </Button>
                </CardContent>
              </Card>
            ))} 
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Dish</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Agent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={`order-${order.id}`}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.dishName}</p>
                        <p className="text-sm text-gray-500">Qty: {order.quantity}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{order.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>₹{order.price}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status as any} />
                    </TableCell>
                    <TableCell>
                      {order.deliveryAgent ? (
                        <div>
                          <p className="font-medium">{order.deliveryAgent.name}</p>
                          <p className="text-sm text-gray-500">{order.deliveryAgent.phone}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details - #{selectedOrder.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>
                  <div className="flex items-start gap-2 mt-2">
                    <MapPin className="h-4 w-4 mt-1 text-gray-400" />
                    <span>{selectedOrder.deliveryAddress}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <p><strong>Dish:</strong> {selectedOrder.dishName}</p>
                  <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                  <p><strong>Total:</strong> ₹{selectedOrder.price}</p>
                  <p><strong>Status:</strong> <OrderStatusBadge status={selectedOrder.status as any} /></p>
                </div>
              </div>
              {selectedOrder.deliveryAgent && (
                <div>
                  <h3 className="font-medium mb-2">Delivery Agent</h3>
                  <p><strong>Name:</strong> {selectedOrder.deliveryAgent.name}</p>
                  <p><strong>Phone:</strong> {selectedOrder.deliveryAgent.phone}</p>
                  <p><strong>Vehicle:</strong> {selectedOrder.deliveryAgent.vehicleNumber}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const HotelDashboard: React.FC = () => (
  <HotelProvider>
    <HotelDashboardInner />
  </HotelProvider>
);

export default HotelDashboard;