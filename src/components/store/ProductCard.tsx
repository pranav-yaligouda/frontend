import React from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full transition hover:shadow-lg">
      <img
        src={product.image || '/public/placeholder.png'}
        alt={product.name}
        className="w-full h-40 object-cover rounded-md mb-2"
      />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold truncate" title={product.name}>{product.name}</h3>
          <p className="text-sm text-gray-500 mb-1">{product.category}</p>
          <p className="text-base font-bold text-primary mb-1">₹{product.price}</p>
          <p className="text-xs text-gray-400">Stock: {product.stockQuantity}</p>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={() => onEdit(product)} aria-label="Edit product">Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(product._id)} aria-label="Delete product">Delete</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 