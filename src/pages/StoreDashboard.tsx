import * as React from "react";
import { getMyStore, updateMyStore } from '@/api/storeApi';
import { useStore } from '@/context/StoreContext';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/Loader';
import { toast } from 'sonner';
import StoreInfoModal from '../components/store/StoreInfoModal';
import ProductList from '../components/store/ProductList';
import ProductModal from '../components/store/ProductModal';
import { Product } from '@/types/product';
import { PRODUCT_CATEGORIES } from '@/constants/productCategorization';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultTimings = WEEKDAYS.map(day => ({ day, open: '09:00', close: '21:00', closed: false }));

const StoreDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { store, setStore, refreshStore, loading } = useStore();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [storeNameOnly, setStoreNameOnly] = React.useState<string | null>(null);

  // Product management state
  const [productModalOpen, setProductModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | undefined>(undefined);
  const [productListKey, setProductListKey] = React.useState(0); // for refresh

  // Restrict access to store owners only
  if (!authLoading && (!user || user.role !== UserRole.STORE_OWNER)) {
    return <Navigate to="/" replace />;
  }

  React.useEffect(() => {
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
    <div className="max-w-5xl mx-auto p-4">
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
            ? Object.fromEntries(Object.entries(store.timings).map(([day, t]) => {
                type TimingObj = { open: string; close: string; closed?: boolean; holiday?: boolean };
                const timing = t as TimingObj;
                return [
                  day,
                  {
                    open: timing.open,
                    close: timing.close,
                    holiday: timing.holiday ?? timing.closed ?? false
                  }
                ];
              }))
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
          } catch (err: unknown) {
            function isAxiosError(e: unknown): e is { response: { data: { error: string } } } {
              return (
                typeof e === 'object' &&
                e !== null &&
                'response' in e &&
                typeof (e as { response?: unknown }).response === 'object' &&
                (e as { response?: { data?: unknown } }).response !== null &&
                'data' in (e as { response: { data?: unknown } }).response! &&
                typeof ((e as { response: { data?: unknown } }).response as { data?: unknown }).data === 'object' &&
                ((e as { response: { data: { error?: unknown } } }).response.data as { error?: unknown }).error !== undefined
              );
            }
            if (isAxiosError(err)) {
              toast.error(err.response.data.error);
            } else {
              toast.error('Failed to update store');
            }
          } finally {
            setSubmitting(false);
          }
        }}
      />

      {/* Product Management Section */}
      {store && store._id && (
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <Button onClick={() => { setEditingProduct(undefined); setProductModalOpen(true); }}>
              + Add Product
            </Button>
          </div>
          <ProductList
            key={productListKey}
            storeId={store._id}
            categories={PRODUCT_CATEGORIES}
            onEdit={product => { setEditingProduct(product); setProductModalOpen(true); }}
          />
          <ProductModal
            open={productModalOpen}
            onClose={() => setProductModalOpen(false)}
            initial={editingProduct}
            categories={PRODUCT_CATEGORIES}
            storeId={store._id}
            storeName={store.name}
            onSave={() => { setProductListKey(k => k + 1); setEditingProduct(undefined); }}
          />
        </div>
      )}
    </div>
  );
};

export default StoreDashboard;
