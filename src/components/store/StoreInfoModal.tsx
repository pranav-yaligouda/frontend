import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import LocationInputWithMap from '../ui/LocationInputWithMap';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PRODUCT_CATEGORIES } from '@/constants/productCategorization';

const WEEKDAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export interface StoreInfo {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  timings: Record<string, { open: string; close: string; holiday: boolean }>;
  holidays: string[];
  categories: string[];
}

interface StoreInfoModalProps {
  open: boolean;
  onSubmit: (data: StoreInfo) => void;
  initial?: Partial<StoreInfo>;
  loading?: boolean;
}

const StoreInfoModal: React.FC<StoreInfoModalProps> = ({ open, onSubmit, initial, loading }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<StoreInfo>({
    name: initial?.name || '',
    address: initial?.address || '',
    location: initial?.location || { lat: 12.9716, lng: 77.5946 },
    timings: initial?.timings || WEEKDAYS.reduce((acc, day) => ({ ...acc, [day]: { open: '09:00', close: '21:00', holiday: false } }), {} as Record<string, { open: string; close: string; holiday: boolean }>),
    holidays: initial?.holidays || [],
    categories: initial?.categories || [],
  });

  useEffect(() => {
    setForm({
      name: initial?.name || '',
      address: initial?.address || '',
      location: initial?.location || { lat: 12.9716, lng: 77.5946 },
      timings: initial?.timings || WEEKDAYS.reduce((acc, day) => ({ ...acc, [day]: { open: '09:00', close: '21:00', holiday: false } }), {} as Record<string, { open: string; close: string; holiday: boolean }>),
      holidays: initial?.holidays || [],
      categories: initial?.categories || [],
    });
  }, [initial]);
  const [calendarDates, setCalendarDates] = useState<Date[]>(initial?.holidays ? initial.holidays.map(d => new Date(d)) : []);

  useEffect(() => {
    setForm(f => ({ ...f, holidays: calendarDates.map(d => d.toISOString().slice(0, 10)) }));
  }, [calendarDates]);

  const handleLocationChange = (addr: { addressLine: string; coordinates: { lat: number; lng: number } | null }) => {
    setForm(f => ({ ...f, address: addr.addressLine, location: addr.coordinates || f.location }));
  };

  const handleTimingChange = (day: string, key: 'open' | 'close' | 'holiday', value: string | boolean) => {
    setForm(f => ({
      ...f,
      timings: {
        ...f.timings,
        [day]: { ...f.timings[day], [key]: value }
      }
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm(f => ({ ...f, categories: selected }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8">
        <DialogHeader>
          <DialogTitle>Store Details</DialogTitle>
          <DialogDescription>
            Please provide your store's information and business hours.
          </DialogDescription>
        </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="store-name" className="font-semibold">Store Name</label>
                  <Input
                    id="store-name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    readOnly={!!initial?.name}
                    className={initial?.name ? "w-full bg-gray-100 cursor-not-allowed" : "w-full"}
                  />
                </div>
                <LocationInputWithMap
                  value={{ addressLine: form.address, coordinates: form.location }}
                  onChange={handleLocationChange}
                />
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setStep(2)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold">Weekly Timings</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {WEEKDAYS.map(day => (
                      <div key={day} className="space-y-2">
                        <span>{day}</span>
                        <div className="flex gap-2 items-center">
                          <input
                            type="time"
                            value={form.timings[day].open}
                            onChange={e => handleTimingChange(day, 'open', e.target.value)}
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={form.timings[day].close}
                            onChange={e => handleTimingChange(day, 'close', e.target.value)}
                          />
                          <input
                            type="checkbox"
                            checked={form.timings[day].holiday}
                            onChange={e => handleTimingChange(day, 'holiday', e.target.checked)}
                          />
                          <span>Holiday</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-semibold">Holiday Calendar</label>
                  <Calendar
                    mode="multiple"
                    selected={calendarDates}
                    onSelect={setCalendarDates}
                    className="rounded-md border"
                  />
                </div>
                <div>
                  <label className="font-semibold">Product Categories</label>
                  <select
                    multiple
                    className="w-full min-h-[80px] border rounded"
                    value={form.categories}
                    onChange={handleCategoryChange}
                  >
                    {PRODUCT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </form>
      </DialogContent>
    </Dialog>
  );
};

export default StoreInfoModal;
