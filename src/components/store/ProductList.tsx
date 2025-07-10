import * as React from "react";
import { useEffect, useState } from 'react';
import { getStoreProducts, deleteProduct } from '@/api/product';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/Loader';
import { toast } from '@/components/ui/use-toast';

interface ProductListProps {
  storeId: string;
  categories: string[];
  onEdit: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ storeId, categories, onEdit }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getStoreProducts(storeId, { category: category || undefined });
      setProducts(res.data.data.items);
    } catch (error) {
      // Error toast is handled globally
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, category]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast({ title: 'Product deleted' });
      fetchProducts();
    } catch (error) {
      // Error toast is handled globally
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label htmlFor="category" className="text-sm font-medium">Category:</label>
        <select
          id="category"
          className="border rounded px-2 py-1"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40"><Loader /></div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList; 