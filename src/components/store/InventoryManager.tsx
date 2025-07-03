
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  ArrowUp, 
  ArrowDown, 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle,
  BarChart
} from "lucide-react";
import { toast } from "sonner";
import { 
  Product, 
  StoreProduct,
  addInventoryTransaction,
  getStoreProductsByStore,
  getProductsWithLowStock,
  updateStoreProductStock
} from "@/data/models";

interface InventoryManagerProps {
  storeId: string;
  products: Product[];
}

const InventoryManager = ({ storeId, products }: InventoryManagerProps) => {
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<StoreProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [transactionQuantity, setTransactionQuantity] = useState<number>(0);
  const [transactionNotes, setTransactionNotes] = useState<string>("");
  const [transactionType, setTransactionType] = useState<'restock' | 'adjustment'>('restock');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch store products and low stock products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [storeProductsData, lowStockProductsData] = await Promise.all([
          getStoreProductsByStore(storeId),
          getProductsWithLowStock(storeId)
        ]);
        
        setStoreProducts(storeProductsData);
        setLowStockProducts(lowStockProductsData);
      } catch (error) {
        console.error("Failed to fetch inventory data:", error);
        toast.error("Failed to load inventory data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [storeId]);

  // Get the full product details from a store product
  const getProductDetails = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  // Get the store product from product id
  const getStoreProduct = (productId: string) => {
    return storeProducts.find(sp => sp.productId === productId);
  };

  // Handle inventory transaction
  const handleInventoryTransaction = async () => {
    if (!selectedProduct) return;
    if (transactionQuantity === 0) {
      toast.error("Quantity must not be zero");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine the actual quantity to use based on transaction type
      const actualQuantity = transactionType === 'restock' 
        ? Math.abs(transactionQuantity) 
        : transactionQuantity;
      
      // Add the transaction
      await addInventoryTransaction({
        storeId,
        productId: selectedProduct.id,
        quantity: actualQuantity,
        type: transactionType,
        createdBy: "2", // Hardcoded for demo, should be user ID
        notes: transactionNotes
      });
      
      // Get the updated store product after transaction
      const updatedStoreProducts = await getStoreProductsByStore(storeId);
      setStoreProducts(updatedStoreProducts);
      
      // Update low stock products
      const updatedLowStock = await getProductsWithLowStock(storeId);
      setLowStockProducts(updatedLowStock);
      
      // Reset form
      setSelectedProduct(null);
      setTransactionQuantity(0);
      setTransactionNotes("");
      
      toast.success(`Inventory ${transactionType} recorded successfully`);
    } catch (error) {
      console.error(`Failed to record ${transactionType}:`, error);
      toast.error(`Failed to record ${transactionType}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update minimum stock level
  const handleUpdateMinStockLevel = async (productId: string, value: number) => {
    const storeProduct = storeProducts.find(sp => sp.productId === productId);
    
    if (!storeProduct) return;
    
    try {
      // In a real app, this would be an API call to update min stock level
      // For this demo, we'll update it directly in the state
      const updatedStoreProducts = storeProducts.map(sp => {
        if (sp.productId === productId) {
          return { ...sp, minStockLevel: value, reorderPoint: value * 1.5 };
        }
        return sp;
      });
      
      setStoreProducts(updatedStoreProducts);
      toast.success("Stock level updated");
    } catch (error) {
      console.error("Failed to update stock level:", error);
      toast.error("Failed to update stock level");
    }
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alert Section */}
      {lowStockProducts.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-amber-700">
              {lowStockProducts.length} products need to be restocked soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {lowStockProducts.map(product => {
                const productDetails = getProductDetails(product.productId);
                if (!productDetails) return null;
                
                return (
                  <li 
                    key={product.productId} 
                    className="flex justify-between items-center text-sm py-1 border-b border-amber-100"
                  >
                    <span>{productDetails.name}</span>
                    <div className="flex items-center">
                      <span className="font-medium text-amber-800 mr-2">
                        {product.stockQuantity} / {product.minStockLevel}
                      </span>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Restock</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Restock {productDetails.name}</DialogTitle>
                            <DialogDescription>
                              Add inventory to this product.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="quantity" className="text-right">
                                Current Stock
                              </Label>
                              <div className="col-span-3">
                                <span className="font-medium">{product.stockQuantity}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="quantity" className="text-right">
                                Quantity to Add
                              </Label>
                              <Input
                                id="quantity"
                                type="number"
                                value={transactionQuantity}
                                onChange={(e) => setTransactionQuantity(Number(e.target.value))}
                                className="col-span-3"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="notes" className="text-right">
                                Notes
                              </Label>
                              <Input
                                id="notes"
                                value={transactionNotes}
                                onChange={(e) => setTransactionNotes(e.target.value)}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={() => {
                              setSelectedProduct(productDetails);
                              setTransactionType('restock');
                              handleInventoryTransaction();
                            }} disabled={isSubmitting}>
                              {isSubmitting ? "Processing..." : "Add Stock"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Inventory Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Inventory Management
          </CardTitle>
          <CardDescription>
            Manage product stock levels and set reorder points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Loading inventory data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Current Stock</TableHead>
                    <TableHead className="text-center">Min Level</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const storeProduct = getStoreProduct(product.id);
                    const stockQuantity = storeProduct?.stockQuantity || 0;
                    const minStockLevel = storeProduct?.minStockLevel || 5;
                    
                    const stockStatus = 
                      stockQuantity === 0 ? "out-of-stock" :
                      stockQuantity <= minStockLevel ? "low" : "good";
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="object-cover w-12 h-12 rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-center">
                          <span className={`font-medium ${
                            stockStatus === "out-of-stock" ? "text-red-500" :
                            stockStatus === "low" ? "text-amber-500" :
                            "text-green-600"
                          }`}>
                            {stockQuantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input 
                            type="number" 
                            value={minStockLevel}
                            min={1}
                            onChange={(e) => handleUpdateMinStockLevel(product.id, Number(e.target.value))}
                            className="w-16 text-center mx-auto"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            stockStatus === "out-of-stock" ? "bg-red-100 text-red-800" :
                            stockStatus === "low" ? "bg-amber-100 text-amber-800" :
                            "bg-green-100 text-green-800"
                          }`}>
                            {stockStatus === "out-of-stock" ? "Out of Stock" :
                             stockStatus === "low" ? "Low Stock" :
                             "In Stock"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <ArrowUp className="w-4 h-4 mr-1" />
                                Add
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Inventory for {product.name}</DialogTitle>
                                <DialogDescription>
                                  Add stock to the current inventory level.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="quantity" className="text-right">
                                    Current Stock
                                  </Label>
                                  <div className="col-span-3">
                                    <span className="font-medium">{stockQuantity}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="quantity" className="text-right">
                                    Quantity to Add
                                  </Label>
                                  <Input
                                    id="quantity"
                                    type="number"
                                    min={1}
                                    value={transactionQuantity}
                                    onChange={(e) => setTransactionQuantity(Number(e.target.value))}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="notes" className="text-right">
                                    Notes
                                  </Label>
                                  <Input
                                    id="notes"
                                    value={transactionNotes}
                                    onChange={(e) => setTransactionNotes(e.target.value)}
                                    className="col-span-3"
                                    placeholder="e.g., 'Weekly restock'"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={() => {
                                  setSelectedProduct(product);
                                  setTransactionType('restock');
                                  handleInventoryTransaction();
                                }} disabled={isSubmitting}>
                                  {isSubmitting ? "Processing..." : "Add Stock"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <BarChart className="w-4 h-4 mr-1" />
                                Adjust
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adjust Inventory for {product.name}</DialogTitle>
                                <DialogDescription>
                                  Make inventory adjustments (positive or negative).
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="quantity" className="text-right">
                                    Current Stock
                                  </Label>
                                  <div className="col-span-3">
                                    <span className="font-medium">{stockQuantity}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="quantity" className="text-right">
                                    Adjustment
                                  </Label>
                                  <div className="col-span-3 flex">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="rounded-r-none"
                                      onClick={() => setTransactionQuantity(prev => prev - 1)}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                      id="quantity"
                                      type="number"
                                      value={transactionQuantity}
                                      onChange={(e) => setTransactionQuantity(Number(e.target.value))}
                                      className="rounded-none text-center"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      className="rounded-l-none"
                                      onClick={() => setTransactionQuantity(prev => prev + 1)}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="notes" className="text-right">
                                    Reason
                                  </Label>
                                  <Input
                                    id="notes"
                                    value={transactionNotes}
                                    onChange={(e) => setTransactionNotes(e.target.value)}
                                    className="col-span-3"
                                    placeholder="e.g., 'Inventory count', 'Damaged goods'"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={() => {
                                  setSelectedProduct(product);
                                  setTransactionType('adjustment');
                                  handleInventoryTransaction();
                                }} disabled={isSubmitting}>
                                  {isSubmitting ? "Processing..." : "Save Adjustment"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManager;
