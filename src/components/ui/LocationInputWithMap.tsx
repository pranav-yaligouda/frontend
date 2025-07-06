import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const libraries = ['places'];
const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // Default to Bangalore

interface Address {
  addressLine: string;
  coordinates: { lat: number; lng: number } | null;
}

interface LocationInputWithMapProps {
  value: Address;
  onChange: (address: Address) => void;
}

const extractFromComponents = (components: any[], type: string) => {
  const comp = components.find(c => c.types.includes(type));
  return comp ? comp.long_name : '';
};

const getAddressFromLatLng = async (lat: number, lng: number): Promise<Address> => {
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        resolve({
          addressLine: results[0].formatted_address,
          coordinates: { lat, lng },
        });
      } else {
        reject('Unable to fetch address');
      }
    });
  });
};

const LocationInputWithMap: React.FC<LocationInputWithMapProps> = ({ value, onChange }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries as any,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number }>(value?.coordinates || defaultCenter);
  const [address, setAddress] = useState<Address>(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value && value.coordinates) {
      setMarker(value.coordinates);
      setAddress(value);
    }
  }, [value]);

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    setLoading(true);
    setError(null);
    try {
      const addr = await getAddressFromLatLng(lat, lng);
      setAddress(addr);
      onChange(addr);
    } catch (err: any) {
      setError('Failed to get address from location');
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={{ height: '300px', width: '100%' }}
        center={marker}
        zoom={15}
        onClick={handleMapClick}
      >
        <Marker position={marker} />
      </GoogleMap>
      <div style={{ marginTop: 12 }}>
        <div><strong>Selected Address:</strong></div>
        {loading ? (
          <div>Fetching address...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <>
            <div>{address.addressLine}</div>
            <div></div>
            <div>Lat: {marker.lat}, Lng: {marker.lng}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default LocationInputWithMap;
