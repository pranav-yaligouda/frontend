
// Type definitions for Google Maps API
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
      setZoom(zoom: number): void;
      getZoom(): number;
      fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
      setOptions(options: MapOptions): void;
    }
    
    class DirectionsService {
      route(request: DirectionsRequest, callback: (result: DirectionsResult | null, status: DirectionsStatus) => void): void;
    }
    
    class DirectionsRenderer {
      constructor(opts?: DirectionsRendererOptions);
      setMap(map: Map | null): void;
      setDirections(directions: DirectionsResult): void;
      setOptions(options: DirectionsRendererOptions): void;
    }
    
    interface DirectionsRequest {
      origin: string | LatLng | LatLngLiteral | Place;
      destination: string | LatLng | LatLngLiteral | Place;
      travelMode: TravelMode;
      waypoints?: DirectionsWaypoint[];
      optimizeWaypoints?: boolean;
    }
    
    interface DirectionsWaypoint {
      location: string | LatLng | LatLngLiteral | Place;
      stopover: boolean;
    }
    
    interface DirectionsResult {
      routes: DirectionsRoute[];
    }
    
    interface DirectionsRoute {
      bounds: LatLngBounds;
      legs: DirectionsLeg[];
    }
    
    interface DirectionsLeg {
      distance: Distance;
      duration: Duration;
      start_location: LatLng;
      end_location: LatLng;
      steps: DirectionsStep[];
    }
    
    interface DirectionsStep {
      distance: Distance;
      duration: Duration;
      start_location: LatLng;
      end_location: LatLng;
      instructions: string;
    }
    
    interface Distance {
      text: string;
      value: number;
    }
    
    interface Duration {
      text: string;
      value: number;
    }
    
    interface DirectionsRendererOptions {
      map?: Map;
      directions?: DirectionsResult;
      panel?: Element;
      suppressMarkers?: boolean;
      polylineOptions?: PolylineOptions;
    }
    
    interface PolylineOptions {
      strokeColor?: string;
      strokeWeight?: number;
      strokeOpacity?: number;
    }
    
    interface Place {
      location: LatLng;
    }
    
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
    
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
    
    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(latLng: LatLng | LatLngLiteral): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
    }
    
    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }
    
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: MapTypeId;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }
    
    enum MapTypeId {
      ROADMAP = 'roadmap',
      SATELLITE = 'satellite',
      HYBRID = 'hybrid',
      TERRAIN = 'terrain'
    }
    
    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }
    
    enum DirectionsStatus {
      OK = 'OK',
      NOT_FOUND = 'NOT_FOUND',
      ZERO_RESULTS = 'ZERO_RESULTS',
      MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }
    
    interface MapsEventListener {
      remove(): void;
    }
    
    class NavigationControl {
      constructor(opts?: NavigationControlOptions);
    }
    
    interface NavigationControlOptions {
      position?: ControlPosition;
      visualizePitch?: boolean;
    }
    
    enum ControlPosition {
      TOP_LEFT = 1,
      TOP_CENTER = 2,
      TOP = 2,
      TOP_RIGHT = 3,
      LEFT_CENTER = 4,
      LEFT = 5,
      RIGHT = 6,
      LEFT_BOTTOM = 7,
      BOTTOM_LEFT = 8,
      BOTTOM = 9,
      BOTTOM_CENTER = 10,
      BOTTOM_RIGHT = 11,
      RIGHT_BOTTOM = 12,
      RIGHT_CENTER = 13
    }
  }
}
