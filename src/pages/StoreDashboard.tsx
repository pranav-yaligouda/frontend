import React, { useEffect, useState } from 'react';
import { getMyStore, updateMyStore } from '@/utils/storeApi';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/Loader';
import { toast } from 'sonner';
import StoreInfoModal from '../components/store/StoreInfoModal';

const CATEGORY_OPTIONS = [
  'Fruits', 'Vegetables', 'Grocery', 'Dairy', 'Household', 'Stationary', 'Bakery', 'Meat', 'Beverages', 'Other'
];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultTimings = WEEKDAYS.map(day => ({ day, open: '09:00', close: '21:00', closed: false }));

const StoreDashboard: React.FC = () => {
  const { store, setStore, refreshStore, loading } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storeNameOnly, setStoreNameOnly] = useState<string | null>(null);

  useEffect(() => {
    // If store is missing required onboarding fields, open modal
    if (!loading) {
      if (!store || !store.address || !store.location) {
        setStoreNameOnly(store?.name || null);
        setModalOpen(true);
      } else {
        setStoreNameOnly(null);
        setModalOpen(false);
      }
    }
  }, [store, loading]);

  if (loading) return <Loader className="block mx-auto my-24" />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{store?.name || storeNameOnly || 'Your Store'}</h1>
        {/* Only show Edit button if store exists */}
        {store && (
          <button className="bg-blue-600 text-white rounded px-4 py-2" onClick={() => setModalOpen(true)}>
            Edit Store Info
          </button>
        )}
      </div>
      {/* Always render modal if modalOpen is true and storeNameOnly is set */}
      <StoreInfoModal
        open={modalOpen}
        initial={store ? {
          ...store,
          location: store.location && store.location.coordinates
            ? { lat: store.location.coordinates[0], lng: store.location.coordinates[1] }
            : undefined,
          timings: store.timings
            ? Object.fromEntries(Object.entries(store.timings).map(([day, t]) => [
                day,
                {
                  open: t.open,
                  close: t.close,
                  holiday: (t as any).holiday ?? (t as any).closed ?? false
                }
              ]))
            : undefined
        } : undefined}
        loading={submitting}
        onSubmit={async (data) => {
          setSubmitting(true);
          try {
            const timings = Object.fromEntries(
              Object.entries(data.timings).map(([day, t]) => [day, { open: t.open, close: t.close, closed: t.holiday }])
            );
            const payload = { ...data, timings, location: { type: 'Point', coordinates: [data.location.lat, data.location.lng], address: data.address } };
            await updateMyStore(payload);
            await refreshStore();
            toast.success('Store info updated!');
            setModalOpen(false);
          } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Failed to update store');
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
};

export default StoreDashboard;
