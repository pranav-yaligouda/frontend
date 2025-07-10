import * as React from "react";
import { getCatalogProducts } from '@/api/product';
import { addProductToStore } from '@/api/storeApi';
import type { Product } from '@/types/product';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [category, setCategory] = React.useState(initial?.category || '');
  const [search, setSearch] = React.useState('');
  const [catalogProducts, setCatalogProducts] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState({ name: '', unit: 'pieces', description: '', image: '' });
  const [price, setPrice] = React.useState(initial?.price?.toString() || '');
  const [quantity, setQuantity] = React.useState(initial?.stock?.toString() || '');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (category) {
      getCatalogProducts({ category, search }).then(res => setCatalogProducts(res.data.data.items));
    } else {
      setCatalogProducts([]);
    }
  }, [category, search]);

  React.useEffect(() => {
    if (initial) {
      setCategory(initial.category || '');
      setPrice(initial.price?.toString() || '');
      setQuantity(initial.stock?.toString() || '');
      setSelectedProduct(null);
      setIsAddingNew(false);
      setNewProduct({ name: '', unit: 'pieces', description: '', image: '' });
    }
  }, [initial, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = isAddingNew
        ? { ...newProduct, category, price: Number(price), quantity: Number(quantity) }
        : { name: selectedProduct!.name, category, unit: selectedProduct!.unit, price: Number(price), quantity: Number(quantity) };
      await addProductToStore(storeId, data);
      toast({ title: "Product added to inventory!" });
      onSave();
      onClose();
    } catch (err) {
      toast({ title: "Failed to add product", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !loading && v === false && onClose()}>
      <DialogContent className="w-full max-w-md sm:max-w-lg mx-auto p-4 sm:p-8 max-h-[90vh] overflow-y-auto" style={{ width: '95vw', maxWidth: 480 }}>
        <DialogTitle>Add Product</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} required disabled={loading} className="border rounded px-2 py-1 bg-white w-full">
              <option value="" disabled>Select category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          {/* Product Search/Select */}
          {!isAddingNew && (
          <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <input
                type="text"
                placeholder="Search product..."
                value={selectedProduct ? selectedProduct.name : search}
                onChange={e => {
                  setSearch(e.target.value);
                  setSelectedProduct(null);
                }}
                disabled={!category || loading}
                className="border rounded px-2 py-1 w-full"
              />
              <ul className="max-h-32 overflow-y-auto border rounded mt-1 bg-white">
                {(Array.isArray(catalogProducts) ? catalogProducts : []).length === 0 && !loading && search && (
                  <li className="px-2 py-1 text-gray-500">No products found.</li>
                )}
                {(Array.isArray(catalogProducts) ? catalogProducts : []).map(prod => (
                  <li
                    key={prod._id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setSearch(prod.name);
                    }}
                    className={`px-2 py-1 cursor-pointer hover:bg-blue-100 ${selectedProduct?._id === prod._id ? 'bg-blue-200' : ''}`}
                  >
                    {prod.name} ({prod.unit})
                  </li>
                ))}
                {loading && (
                  <li className="px-2 py-1 text-gray-400">Loading...</li>
                )}
              </ul>
              <Button type="button" onClick={() => setIsAddingNew(true)} disabled={!category || loading} className="mt-2">
                + Add New Product
              </Button>
          </div>
          )}
          {/* New Product Fields */}
          {isAddingNew && (
            <>
          <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required disabled={loading} />
          </div>
          <div>
                <label className="block text-sm font-medium mb-1">Unit</label>
                <select value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })} disabled={loading} className="border rounded px-2 py-1 w-full">
                <option value="grams">grams</option>
                <option value="kg">kg</option>
                <option value="pieces">pieces</option>
                  <option value="litres">litres</option>
                  <option value="ml">ml</option>
              </select>
            </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} disabled={loading} />
          </div>
          <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} disabled={loading} />
          </div>
              <Button type="button" onClick={() => setIsAddingNew(false)} disabled={loading} className="mt-2">Back to Catalog</Button>
            </>
          )}
          {/* Price and Quantity */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} required disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min={0} required disabled={loading} />
          </div>
          {/* Submit */}
          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading || !category || (!isAddingNew && !selectedProduct) || !price || !quantity}>
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal; 