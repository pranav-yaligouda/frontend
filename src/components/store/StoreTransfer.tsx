import * as React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Truck, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import type { Store } from "@/types/store";
import type { Product } from "@/types/product";
import { 
  StoreProduct, 
  createStoreTransfer,
  stores 
} from "@/data/models";

interface StoreTransferProps {
  currentStoreId: string;
  products: Product[];
  storeProducts: StoreProduct[];
}

interface TransferItem {
  productId: string;
  name: string;
  quantity: number;
}

const StoreTransfer = ({ currentStoreId, products, storeProducts }: StoreTransferProps) => {
  const [toStoreId, setToStoreId] = React.useState<string>("");
  const [transferItems, setTransferItems] = React.useState<TransferItem[]>([]);
  const [selectedProductId, setSelectedProductId] = React.useState<string>("");
  const [transferQuantity, setTransferQuantity] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get available stores for transfer (excluding current store)
  const availableStores = stores.filter(store => store.id !== currentStoreId);

  // Get product details
  const getProduct = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  // Get current stock quantity for a product
  const getCurrentStock = (productId: string) => {
    const storeProduct = storeProducts.find(sp => sp.productId === productId);
    return storeProduct?.stockQuantity || 0;
  };

  // Add item to transfer list
  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.error("Please select a product");
      return;
    }
    
    if (transferQuantity <= 0) {
      toast.error("Quantity must be positive");
      return;
    }
    
    const currentStock = getCurrentStock(selectedProductId);
    
    if (transferQuantity > currentStock) {
      toast.error(`Not enough stock. Available: ${currentStock}`);
      return;
    }
    
    const product = getProduct(selectedProductId);
    
    if (!product) {
      toast.error("Product not found");
      return;
    }
    
    // Check if product already in list
    const existingItemIndex = transferItems.findIndex(
      item => item.productId === selectedProductId
    );
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const newQuantity = transferItems[existingItemIndex].quantity + transferQuantity;
      
      if (newQuantity > currentStock) {
        toast.error(`Not enough stock. Available: ${currentStock}`);
        return;
      }
      
      const updatedItems = [...transferItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity
      };
      
      setTransferItems(updatedItems);
    } else {
      // Add new item
      setTransferItems([
        ...transferItems,
        {
          productId: selectedProductId,
          name: product.name,
          quantity: transferQuantity
        }
      ]);
    }
    
    // Reset selection
    setSelectedProductId("");
    setTransferQuantity(1);
  };

  // Remove item from transfer list
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...transferItems];
    updatedItems.splice(index, 1);
    setTransferItems(updatedItems);
  };

  // Submit transfer
  const handleSubmitTransfer = async () => {
    if (!toStoreId) {
      toast.error("Please select a destination store");
      return;
    }
    
    if (transferItems.length === 0) {
      toast.error("Please add at least one product");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createStoreTransfer({
        fromStoreId: currentStoreId,
        toStoreId,
        items: transferItems,
        initiatedBy: "2" // Hardcoded for demo, should be user ID
      });
      
      // Reset form
      setToStoreId("");
      setTransferItems([]);
      
      toast.success("Transfer initiated successfully");
    } catch (error) {
      console.error("Failed to initiate transfer:", error);
      toast.error("Failed to initiate transfer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Stock Transfer
        </CardTitle>
        <CardDescription>
          Transfer products between stores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Destination Store Selection */}
          <div className="space-y-2">
            <Label htmlFor="toStore">Destination Store</Label>
            <Select value={toStoreId} onValueChange={setToStoreId}>
              <SelectTrigger id="toStore" className="w-full">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                {availableStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Add Products to Transfer</Label>
            <div className="flex space-x-2">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => {
                    const stock = getCurrentStock(product.id);
                    return (
                      <SelectItem key={product.id} value={product.id} disabled={stock <= 0}>
                        {product.name} ({stock} in stock)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="flex items-center border rounded-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setTransferQuantity(prev => Math.max(1, prev - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(Number(e.target.value))}
                  className="w-16 border-0 text-center"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setTransferQuantity(prev => prev + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Transfer Items List */}
          {transferItems.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border rounded-md p-8 text-center text-gray-500">
              No products added to transfer
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setToStoreId("");
            setTransferItems([]);
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmitTransfer} 
          disabled={transferItems.length === 0 || !toStoreId || isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Initiate Transfer"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StoreTransfer;
