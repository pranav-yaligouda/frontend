import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { Autocomplete } from '@react-google-maps/api';

// Extend the Window type to include _advancedMarker
declare global {
  interface Window {
    _advancedMarker?: google.maps.marker.AdvancedMarkerElement;
  }
}

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_CENTER = { lat: 13.0943, lng: 76.8029 }; // Athani, Karnataka coordinates
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const GOOGLE_MAPS_LIBRARIES = ['places']; // Fix: static array for useJsApiLoader
const MAP_ID = "DEMO_MAP_ID"; // Use your real mapId in production

const hotelSchema = z.object({
  name: z.string().min(2),
  image: z.any().optional(),
  address: z.string().min(5),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string()
  }),
  timings: z.record(z.object({
    open: z.string(),
    close: z.string(),
    holiday: z.boolean()
  })),
  holidays: z.array(z.string())
});

type HotelFormType = z.infer<typeof hotelSchema>; // Single type declaration

export const HotelInfoModal = ({ open, onSubmit, initial, loading }: {
  open: boolean;
  onSubmit: (data: HotelFormType) => void;
  initial?: Partial<HotelFormType>;
  loading?: boolean;
}) => {
  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image ?? null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(initial?.location ? { lat: initial.location.lat, lng: initial.location.lng } : null);
  const [calendarDates, setCalendarDates] = useState<Date[]>(initial?.holidays ? initial.holidays.map(d => new Date(d)) : []);
  const [addressLoading, setAddressLoading] = useState(false);
  const [mapZoom, setMapZoom] = useState(15);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapStyles = { width: '100%', height: 400, borderRadius: 8, overflow: 'hidden', marginBottom: 16 };

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<HotelFormType>({
    resolver: zodResolver(hotelSchema),
    defaultValues: initial ? {
      ...initial,
      timings: WEEKDAYS.reduce((acc, day) => ({
        ...acc,
        [day]: {
          open: initial.timings?.[day]?.open ?? '09:00',
          close: initial.timings?.[day]?.close ?? '22:00',
          holiday: !!initial.timings?.[day]?.holiday,
        }
      }), {} as Record<string, { open: string; close: string; holiday: boolean }>),
    } : {
      name: '',
      address: '',
      location: { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng, address: '' },
      timings: WEEKDAYS.reduce((acc, day) => ({ ...acc, [day]: { open: '09:00', close: '22:00', holiday: false } }), {} as Record<string, { open: string; close: string; holiday: boolean }>),
      holidays: [],
    },
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES as unknown as ["places"]
  });

  // Reverse geocode to get address from lat/lng
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    setAddressLoading(true);
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await res.json();
      if (data.results && data.results[0]) {
        setValue('address', data.results[0].formatted_address);
        setValue('location', { lat, lng, address: data.results[0].formatted_address });
      }
    } finally {
      setAddressLoading(false);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedCoords({ lat, lng });
      fetchAddressFromCoords(lat, lng);
    }
  };

  const onCalendarChange = (dates: Date[]) => {
    setCalendarDates(dates);
    setValue('holidays', dates.map(d => d.toISOString().split('T')[0]));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const submitHandler = async (values: HotelFormType) => {
    let imageBase64 = values.image;
    if (values.image instanceof File) {
      imageBase64 = await fileToBase64(values.image);
    }
    const location = {
      type: 'Point',
      coordinates: [values.location.lng, values.location.lat],
      address: values.location.address || values.address || '',
    };
    const payload = {
      ...values,
      image: imageBase64,
      location,
    };
    onSubmit(payload);
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8">
        <DialogHeader>
          <DialogTitle>Set Up Your Hotel Info</DialogTitle>
          <DialogDescription>
            Update your hotel's information and business hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitHandler)}>
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Hotel Name</Label>
                <Input {...control.register('name')} placeholder="Enter hotel name" />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
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
                      alert('Image too large (max 4MB).');
                      return;
                    }
                    setValue('image', file);
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Hotel preview" className="mt-2 w-32 h-32 object-cover rounded border" />
                )}
              </div>
              <div>
                <Label>Map Location</Label>
                <div style={mapStyles} className="relative">
                  <GoogleMap
                    zoom={mapZoom}
                    center={selectedCoords || DEFAULT_CENTER}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    onClick={handleMapClick}
                    onLoad={map => {
                      mapRef.current = map;
                      if (!selectedCoords) map.panTo(DEFAULT_CENTER);
                    }}
                    options={{
                      fullscreenControl: false, // We'll add our own button
                      zoomControl: false, // We'll add our own buttons
                      mapId: MAP_ID,
                    }}
                  >
                    {/* AdvancedMarkerElement implementation */}
                    {selectedCoords && window.google?.maps?.marker?.AdvancedMarkerElement ? (
                      (() => {
                        // Remove any previous advanced marker
                        if (window._advancedMarker) window._advancedMarker.map = null;
                        // Create and add AdvancedMarkerElement
                        const marker = new window.google.maps.marker.AdvancedMarkerElement({
                          map: mapRef.current,
                          position: selectedCoords,
                          title: 'Hotel Location',
                        });
                        window._advancedMarker = marker;
                        return null;
                      })()
                    ) : selectedCoords && (
                      <MarkerF
                        position={selectedCoords}
                        options={{
                          animation: google.maps.Animation.DROP,
                          icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: '#FF0000',
                            fillOpacity: 0.8,
                            scale: 10,
                            strokeColor: '#FFFFFF',
                            strokeWeight: 2
                          }
                        }}
                      />
                    )}
                  </GoogleMap>
                  {/* Locate button */}
                  <button
                    type="button"
                    aria-label="Locate me"
                    className="absolute top-2 right-2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100 border border-gray-300"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(pos => {
                          const lat = pos.coords.latitude;
                          const lng = pos.coords.longitude;
                          setSelectedCoords({ lat, lng });
                          fetchAddressFromCoords(lat, lng);
                          if (mapRef.current) mapRef.current.panTo({ lat, lng });
                        });
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5ZM12 2.25v2.25M12 19.5v2.25M4.81 4.81l1.59 1.59M17.6 17.6l1.59 1.59M2.25 12h2.25M19.5 12h2.25M4.81 19.19l1.59-1.59M17.6 6.4l1.59-1.59" />
                    </svg>
                  </button>
                  {/* Fullscreen button */}
                  <button
                    type="button"
                    aria-label="Fullscreen"
                    className="absolute top-2 left-2 z-10 bg-white rounded-full shadow p-2 hover:bg-gray-100 border border-gray-300"
                    onClick={() => {
                      const mapDiv = mapRef.current?.getDiv();
                      if (mapDiv?.requestFullscreen) mapDiv.requestFullscreen();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9V5.25A2.25 2.25 0 0 1 6 3h3.75M20.25 9V5.25A2.25 2.25 0 0 0 18 3h-3.75M3.75 15v3.75A2.25 2.25 0 0 0 6 21h3.75M20.25 15v3.75A2.25 2.25 0 0 1 18 21h-3.75" />
                    </svg>
                  </button>
                  {/* Zoom in/out buttons */}
                  <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-2">
                    <button
                      type="button"
                      aria-label="Zoom in"
                      className="bg-white rounded-full shadow p-2 hover:bg-gray-100 border border-gray-300"
                      onClick={() => {
                        setMapZoom(prev => Math.min(prev + 1, 21));
                      }}
                    >
                      <span className="text-2xl font-bold">+</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Zoom out"
                      className="bg-white rounded-full shadow p-2 hover:bg-gray-100 border border-gray-300"
                      onClick={() => {
                        setMapZoom(prev => Math.max(prev - 1, 0));
                      }}
                    >
                      <span className="text-2xl font-bold">-</span>
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  {...control.register('address')}
                  placeholder="Hotel address"
                  value={watch('address')}
                  onChange={e => setValue('address', e.target.value)}
                  disabled={addressLoading}
                />
                {addressLoading && <p className="text-xs text-gray-500">Detecting address...</p>}
                {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => setStep(2)}>
                  Next
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label>Business Hours</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="space-y-2">
                      <Label>{day}</Label>
                      <div className="flex gap-2">
                        <Input
                          type="time"
                          value={watch(`timings.${day}.open`) || '09:00'}
                          onChange={e => setValue(`timings.${day}.open`, e.target.value)}
                        />
                        <span className="text-sm">-</span>
                        <Input
                          type="time"
                          value={watch(`timings.${day}.close`) || '22:00'}
                          onChange={e => setValue(`timings.${day}.close`, e.target.value)}
                        />
                        <div className="flex items-center ml-2">
                          <input
                            type="checkbox"
                            checked={watch(`timings.${day}.holiday`) || false}
                            onChange={e => setValue(`timings.${day}.holiday`, e.target.checked)}
                          />
                          <Label htmlFor={`holiday-${day}`} className="ml-2">
                            Holiday
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Holidays</Label>
                <Calendar
                  mode="multiple"
                  selected={calendarDates}
                  onSelect={onCalendarChange}
                  className="rounded-md border"
                />
              </div>
              <div className="flex justify-between gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
