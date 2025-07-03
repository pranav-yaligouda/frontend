import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

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

type HotelFormType = z.infer<typeof hotelSchema>;

const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const HotelInfoModal = ({ open, onSubmit, initial, loading }: {
  open: boolean;
  onSubmit: (data: any) => void;
  initial?: Partial<HotelFormType>;
  loading?: boolean;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image ?? null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(initial?.location ? { lat: initial.location.lat, lng: initial.location.lng } : null);
  const [calendarDates, setCalendarDates] = useState<Date[]>(initial?.holidays ? initial.holidays.map(d => new Date(d)) : []);

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
      }), {} as any),
    } : {
      name: '',
      address: '',
      location: { lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng, address: '' },
      timings: WEEKDAYS.reduce((acc, day) => ({ ...acc, [day]: { open: '09:00', close: '22:00', holiday: false } }), {} as any),
      holidays: [],
    },
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert('Image too large (max 4MB).');
        return;
      }
      setValue('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      setValue('location', { lat: e.latLng.lat(), lng: e.latLng.lng(), address: '' });
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


  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8">
        <DialogHeader>
  <DialogTitle>Set Up Your Hotel Info</DialogTitle>
  <DialogDescription>
    Please fill out all required fields to continue. Your hotel info must be complete to manage dishes and orders.
  </DialogDescription>
</DialogHeader>
        <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit((values, e) => { if (e) e.preventDefault(); submitHandler(values); })}>
          <div>
            <Label>Hotel Name</Label>
            <Controller name="name" control={control} render={({ field }) => (
              <Input {...field} disabled={loading} />
            )} />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <Label>Hotel Photo</Label>
            <Input type="file" accept="image/*" onChange={onImageChange} disabled={loading} />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-24 rounded" />}
          </div>
          <div>
            <Label>Address</Label>
            <Controller name="address" control={control} render={({ field }) => (
              <Input {...field} disabled={loading} />
            )} />
            {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
          </div>
          <div>
            <Label>Location (Pick on Map)</Label>
            {isLoaded && (
              <div className="h-64 w-full rounded border overflow-hidden">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={selectedCoords || DEFAULT_CENTER}
                  zoom={15}
                  onClick={handleMapClick}
                >
                  {selectedCoords && <Marker position={selectedCoords} />}
                </GoogleMap>
              </div>
            )}
            {errors.location && <span className="text-red-500 text-xs">{errors.location.message as string}</span>}
          </div>
          <div>
            <Label>Weekly Timings</Label>
            <div className="overflow-x-auto">
  <table className="min-w-full border rounded text-sm">
    <thead>
      <tr className="bg-gray-50">
        <th className="px-2 py-1 text-left font-medium">Day</th>
        <th className="px-2 py-1 text-left font-medium">Open</th>
        <th className="px-2 py-1 text-left font-medium">Close</th>
        <th className="px-2 py-1 text-center font-medium">Holiday</th>
      </tr>
    </thead>
    <tbody>
      {WEEKDAYS.map(day => (
        <tr key={day} className="border-b">
          <td className="px-2 py-1 w-24 font-medium">{day}</td>
          <td className="px-2 py-1">
            <Controller name={`timings.${day}.open`} control={control} render={({ field }) => (
              <Input type="time" {...field} value={field.value ?? ''} className="w-28" disabled={loading} />
            )} />
          </td>
          <td className="px-2 py-1">
            <Controller name={`timings.${day}.close`} control={control} render={({ field }) => (
              <Input type="time" {...field} value={field.value ?? ''} className="w-28" disabled={loading} />
            )} />
          </td>
          <td className="px-2 py-1 text-center">
            <Controller name={`timings.${day}.holiday`} control={control} render={({ field: { value, onChange, onBlur, name, ref } }) => (
              <input type="checkbox"
                checked={!!value}
                onChange={e => onChange(e.target.checked)}
                onBlur={onBlur}
                name={name}
                ref={ref}
                className="h-4 w-4 align-middle"
                disabled={loading}
              />
            )} />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
          </div>
          <div>
            <Label>Holidays (Select Dates)</Label>
            <Calendar
              mode="multiple"
              selected={calendarDates}
              onSelect={onCalendarChange}
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>Save Hotel Info</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
