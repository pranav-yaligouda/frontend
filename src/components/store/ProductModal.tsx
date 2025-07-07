import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '@/api/product';
import type { Product } from '@/types/product';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Product>;
  categories: string[];
  storeId: string;
  storeName: string;
  onSave: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ open, onClose, initial, categories, storeId, storeName, onSave }) => {
  const [form, setForm] = useState<Partial<Product>>(initial || {});
  const [loading, setLoading] = useState(false);
  const [stockUnit, setStockUnit] = useState<string>(initial?.unit || 'pieces');
  const isEdit = Boolean(initial && initial._id);

  useEffect(() => {
    setForm(initial || {});
    setStockUnit(initial?.unit || 'pieces');
  }, [initial, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleAvailableChange = (checked: boolean) => {
    setForm(f => ({ ...f, available: checked }));
  };

  const handleStockUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStockUnit(e.target.value as 'grams' | 'kg' | 'pieces');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, storeId, unit: stockUnit as 'grams' | 'kg' | 'pieces' };
      if (isEdit && form._id) {
        await updateProduct(form._id, payload);
        toast({ title: 'Product updated' });
      } else {
        await createProduct(payload);
        toast({ title: 'Product created' });
      }
      onSave();
      onClose();
    } catch (error) {
      // Error toast is handled globally
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !loading && v === false && onClose()}>
      <DialogContent
        className="w-full max-w-md sm:max-w-lg mx-auto p-4 sm:p-8 max-h-[90vh] overflow-y-auto"
        style={{ width: '95vw', maxWidth: 480 }}
      >
        <DialogTitle>{isEdit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Store</label>
            <div className="bg-gray-100 rounded px-3 py-2 text-gray-700 cursor-not-allowed">{storeName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
            <Input
              id="name"
              name="name"
              value={form.name || ''}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="price">Price</label>
            <Input
              id="price"
              name="price"
              type="number"
              value={form.price ?? ''}
              onChange={handleChange}
              required
              min={0}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="stock">Stock</label>
            <div className="flex gap-2">
              <Input
                id="stock"
                name="stock"
                type="number"
                value={form.stock ?? ''}
                onChange={handleChange}
                required
                min={0}
                disabled={loading}
                className="flex-1"
              />
              <select
                value={stockUnit}
                onChange={handleStockUnitChange}
                disabled={loading}
                className="border rounded px-2 py-1 bg-white"
              >
                <option value="grams">grams</option>
                <option value="kg">kg</option>
                <option value="pieces">pieces</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={form.category || ''}
              onChange={handleChange}
              required
              disabled={loading}
              className="border rounded px-2 py-1 bg-white w-full"
            >
              <option value="" disabled>Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="image">Image URL</label>
            <Input
              id="image"
              name="image"
              value={form.image || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
            <Input
              id="description"
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium mb-1" htmlFor="available">Available</label>
            <Switch
              id="available"
              checked={form.available ?? true}
              onCheckedChange={handleAvailableChange}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{isEdit ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal; 