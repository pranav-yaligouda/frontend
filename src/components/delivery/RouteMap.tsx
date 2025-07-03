
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order, Store, stores } from "@/data/models";
import { MapPin } from "lucide-react";

interface RouteMapProps {
  order: Order;
}

const RouteMap = ({ order }: RouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapObjectRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  
  // Load Google Maps API script
  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }
    
    // Create script tag for Google Maps API
    const script = document.createElement('script');
    // Replace YOUR_API_KEY with your actual Google Maps API key or use environment variable
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyA8MsIioT9qPdIj8taGWsWYbGiZErcDBQU'}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("Google Maps API loaded successfully");
      setMapLoaded(true);
    };
    
    script.onerror = () => {
      console.error("Failed to load Google Maps API");
      setMapError("Failed to load Google Maps API");
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up only if the script was added by us
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  // Initialize map when API is loaded and order changes
  useEffect(() => {
    if (mapLoaded && order && mapRef.current) {
      console.log("Initializing map with order:", order);
      initMap();
    }
  }, [mapLoaded, order]);
  
  // Initialize map
  const initMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.error("Cannot initialize map - dependencies not loaded");
      return;
    }
    
    try {
      // Default center if order has no location data
      const defaultCenter = { lat: 16.7359, lng: 75.0689 };
      
      const mapOptions: google.maps.MapOptions = {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };
      
      mapObjectRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
      
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#0066ff',
          strokeWeight: 5,
          strokeOpacity: 0.8
        }
      });
      
      directionsRendererRef.current.setMap(mapObjectRef.current);
      
      calculateRoute();
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Error initializing map");
    }
  };
  
  // Calculate route with waypoints for store pickups
  const calculateRoute = () => {
    if (!window.google || !window.google.maps || !order.optimizedRoute || !mapObjectRef.current || !directionsRendererRef.current) {
      console.error("Cannot calculate route - dependencies not loaded");
      return;
    }
    
    try {
      const { storePickups, customerDropoff } = order.optimizedRoute;
      
      if (storePickups.length === 0) {
        console.error("No store pickups in optimized route");
        return;
      }
      
      // Start at agent's current location, or use first store as starting point
      const startLocation = order.deliveryAgent?.location || storePickups[0].location;
      
      // Create waypoints for each store pickup (except first one, which is the origin)
      const waypoints = storePickups.slice(0).map(store => ({
        location: new window.google.maps.LatLng(store.location.lat, store.location.lng),
        stopover: true
      }));
      
      // End at customer location
      const endLocation = customerDropoff.location;
      
      const directionsService = new window.google.maps.DirectionsService();
      
      // Log route calculation request
      console.log("Calculating route:", {
        origin: startLocation,
        destination: endLocation,
        waypoints: waypoints
      });
      
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(startLocation.lat, startLocation.lng),
          destination: new window.google.maps.LatLng(endLocation.lat, endLocation.lng),
          waypoints: waypoints,
          optimizeWaypoints: true,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && directionsRendererRef.current && result) {
            console.log("Route calculated successfully:", result);
            directionsRendererRef.current.setDirections(result);
            
            // Fit map bounds to show the entire route
            if (mapObjectRef.current && result.routes[0]?.bounds) {
              mapObjectRef.current.fitBounds(result.routes[0].bounds);
            }
          } else {
            console.error("Directions request failed:", status);
            setMapError(`Directions request failed: ${status}`);
          }
        }
      );
    } catch (error) {
      console.error("Error calculating route:", error);
      setMapError("Error calculating route");
    }
  };
  
  // Create a mock implementation if Google Maps API is not available
  const renderMockMap = () => {
    if (!order.optimizedRoute) return null;
    
    const { storePickups, customerDropoff } = order.optimizedRoute;
    
    return (
      <div className="border rounded-lg p-4 bg-gray-100">
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2">Route Information:</h4>
          <ol className="space-y-2 pl-5 list-decimal">
            {storePickups.map((store, index) => (
              <li key={index} className="text-sm">
                Pickup from <span className="font-medium">{store.storeName}</span>
                <ul className="list-disc pl-5 mt-1">
                  {store.items.map((itemId, idx) => {
                    const item = order.items.find(i => i.productId === itemId);
                    return (
                      <li key={idx} className="text-xs">
                        {item ? `${item.quantity}x ${item.name}` : `Unknown item`}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
            <li className="text-sm">
              Deliver to customer at <span className="font-medium">{customerDropoff.address}</span>
            </li>
          </ol>
        </div>
        <div className="h-64 bg-gray-200 flex items-center justify-center border border-dashed border-gray-400 rounded">
          <div className="text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>Map view would appear here with Google Maps API integration</p>
            {mapError && <p className="text-red-500 mt-2">{mapError}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Delivery Route
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mapLoaded && window.google && window.google.maps ? (
          <div ref={mapRef} className="h-80 w-full rounded-md"></div>
        ) : (
          renderMockMap()
        )}
      </CardContent>
    </Card>
  );
};

export default RouteMap;
