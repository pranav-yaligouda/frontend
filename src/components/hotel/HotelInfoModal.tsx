import * as React from "react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_CENTER = { lat: 13.0943, lng: 76.8029 }; // Athani, Karnataka
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_LIBRARIES = ["places"];
const MAP_ID = "DEMO_MAP_ID"; // Replace with your real mapId

const hotelSchema = z.object({
  name: z.string().min(2, "Hotel name is required"),
  image: z.any().optional(),
  address: z.string().min(5, "Address is required"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  timings: z.record(
    z.object({
      open: z.string(),
      close: z.string(),
      holiday: z.boolean(),
    })
  ),
  holidays: z.array(z.string()),
});

type HotelFormType = z.infer<typeof hotelSchema>;

export const HotelInfoModal = ({
  open,
  onSubmit,
  initial,
  loading,
}: {
  open: boolean;
  onSubmit: (data: HotelFormType) => void;
  initial?: Partial<HotelFormType>;
  loading?: boolean;
}) => {
  const [step, setStep] = React.useState(1);
  const [imagePreview, setImagePreview] = React.useState<string | null>(
    initial?.image ?? null
  );
  const [selectedCoords, setSelectedCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(
    initial?.location
      ? { lat: initial.location.lat, lng: initial.location.lng }
      : null
  );
  const [calendarDates, setCalendarDates] = React.useState<Date[]>(
    initial?.holidays ? initial.holidays.map((d) => new Date(d)) : []
  );
  const [addressLoading, setAddressLoading] = React.useState(false);
  const [mapZoom, setMapZoom] = React.useState(15);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const mapStyles = {
    width: "100%",
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  };
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<HotelFormType>({
    resolver: zodResolver(hotelSchema),
    defaultValues: initial
      ? {
          ...initial,
          timings: WEEKDAYS.reduce(
            (acc, day) => ({
              ...acc,
              [day]: {
                open: initial.timings?.[day]?.open ?? "09:00",
                close: initial.timings?.[day]?.close ?? "22:00",
                holiday: !!initial.timings?.[day]?.holiday,
              },
            }),
            {} as Record<string, { open: string; close: string; holiday: boolean }>
          ),
        }
      : {
          name: "",
          address: "",
          location: {
            lat: DEFAULT_CENTER.lat,
            lng: DEFAULT_CENTER.lng,
            address: "",
          },
          timings: WEEKDAYS.reduce(
            (acc, day) => ({
              ...acc,
              [day]: { open: "09:00", close: "22:00", holiday: false },
            }),
            {} as Record<string, { open: string; close: string; holiday: boolean }>
          ),
          holidays: [],
        },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) trigger();
  }, [open, trigger]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES as unknown as ["places"],
  });

  // Reverse geocode to get address from lat/lng
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    setAddressLoading(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.results && data.results[0]) {
        setValue("address", data.results[0].formatted_address, { shouldDirty: true, shouldValidate: true });
        setValue("location", {
          lat,
          lng,
          address: data.results[0].formatted_address,
        }, { shouldDirty: true, shouldValidate: true });
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
    setValue(
      "holidays",
      dates.map((d) => d.toISOString().split("T")[0]),
      { shouldDirty: true }
    );
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const submitHandler = async (values: HotelFormType) => {
    setSubmitting(true);
    try {
      let imageBase64 = values.image;
      if (values.image instanceof File) {
        imageBase64 = await fileToBase64(values.image);
      }
      const location = {
        type: "Point",
        coordinates: [values.location.lng, values.location.lat],
        address: values.location.address || values.address || "",
      };
      const payload = {
        ...values,
        image: imageBase64,
        location,
      };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8">
        <DialogHeader>
          <DialogTitle>Set Up Your Hotel Info</DialogTitle>
          <DialogDescription>
            Update your hotel's information and business hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitHandler)}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label>Hotel Name</Label>
                <Input {...register("name")} placeholder="Enter hotel name" readOnly />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
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
                      alert("Image too large (max 4MB).");
                      return;
                    }
                    setValue("image", file, { shouldDirty: true });
                    setImagePreview(URL.createObjectURL(file));
                  }}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Hotel preview"
                    className="mt-2 w-32 h-32 object-cover rounded border"
                  />
                )}
              </div>
              <div>
                <Label>Map Location</Label>
                <div style={mapStyles} className="relative">
                  <GoogleMap
                    zoom={mapZoom}
                    center={selectedCoords || DEFAULT_CENTER}
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    onClick={handleMapClick}
                    onLoad={(map) => {
                      mapRef.current = map;
                      if (!selectedCoords) map.panTo(DEFAULT_CENTER);
                    }}
                    options={{
                      fullscreenControl: false,
                      zoomControl: false,
                      mapId: MAP_ID,
                    }}
                  >
                    {selectedCoords && (
                      <MarkerF
                        position={selectedCoords}
                        options={{
                          animation: google.maps.Animation.DROP,
                          icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: "#FF0000",
                            fillOpacity: 0.8,
                            scale: 10,
                            strokeColor: "#FFFFFF",
                            strokeWeight: 2,
                          },
                        }}
                      />
                    )}
                  </GoogleMap>
                  {/* Locate and zoom controls */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            const lat = pos.coords.latitude;
                            const lng = pos.coords.longitude;
                            setSelectedCoords({ lat, lng });
                            fetchAddressFromCoords(lat, lng);
                            if (mapRef.current) mapRef.current.panTo({ lat, lng });
                          });
                        }
                      }}
                    >
                      📍
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setMapZoom((z) => Math.min(z + 1, 21))}
                    >
                      +
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setMapZoom((z) => Math.max(z - 1, 0))}
                    >
                      -
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  {...register("address")}
                  placeholder="Hotel address"
                  readOnly
                  disabled={addressLoading}
                />
                {addressLoading && (
                  <p className="text-xs text-gray-500">Detecting address...</p>
                )}
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address.message}</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={() => setStep(2)}>
                  Next
                </Button>
              </div>
            </div>
          )}
          {/* Step 2: Timings and Holidays */}
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
                          value={watch(`timings.${day}.open`) || "09:00"}
                          onChange={(e) =>
                            setValue(`timings.${day}.open`, e.target.value, { shouldDirty: true })
                          }
                        />
                        <span className="text-sm">-</span>
                        <Input
                          type="time"
                          value={watch(`timings.${day}.close`) || "22:00"}
                          onChange={(e) =>
                            setValue(`timings.${day}.close`, e.target.value, { shouldDirty: true })
                          }
                        />
                        <div className="flex items-center ml-2">
                          <input
                            type="checkbox"
                            checked={watch(`timings.${day}.holiday`) || false}
                            onChange={(e) =>
                              setValue(`timings.${day}.holiday`, e.target.checked, { shouldDirty: true })
                            }
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
                <Button type="submit" disabled={loading || submitting || !isValid}>
                  {loading || submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
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
