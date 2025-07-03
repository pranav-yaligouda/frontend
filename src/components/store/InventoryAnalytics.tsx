
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Product, StoreProduct, getInventoryTransactionsByStore } from "@/data/models";

interface InventoryAnalyticsProps {
  storeId: string;
  products: Product[];
  storeProducts: StoreProduct[];
}

const InventoryAnalytics = ({ storeId, products, storeProducts }: InventoryAnalyticsProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [transactionsData, setTransactionsData] = useState<any[]>([]);
  const [stockDistribution, setStockDistribution] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch transactions for this store
        const transactions = await getInventoryTransactionsByStore(storeId);
        
        // Process transactions data for line chart
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });
        
        // Create a map of date to transaction counts
        const transactionsByDate = new Map();
        
        transactions.forEach(transaction => {
          const date = transaction.createdAt.split('T')[0];
          const existingEntry = transactionsByDate.get(date) || { date, inflow: 0, outflow: 0 };
          
          if (transaction.quantity > 0) {
            existingEntry.inflow += transaction.quantity;
          } else {
            existingEntry.outflow += Math.abs(transaction.quantity);
          }
          
          transactionsByDate.set(date, existingEntry);
        });
        
        // Create data for last 7 days
        const transactionsChartData = last7Days.map(date => {
          return transactionsByDate.get(date) || { date, inflow: 0, outflow: 0 };
        });
        
        // Format data for the stock level bar chart
        const stockLevelData = products.map(product => {
          const sp = storeProducts.find(sp => sp.productId === product.id);
          return {
            name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
            stock: sp?.stockQuantity || 0,
            minStock: sp?.minStockLevel || 0,
          };
        });
        
        // Calculate stock distribution by category
        const stockByCategory = new Map();
        
        products.forEach(product => {
          const sp = storeProducts.find(sp => sp.productId === product.id);
          if (!sp) return;
          
          const existingStock = stockByCategory.get(product.category) || 0;
          stockByCategory.set(product.category, existingStock + sp.stockQuantity);
        });
        
        const stockDistributionData = Array.from(stockByCategory.entries()).map(([category, value]) => ({
          name: category,
          value
        }));
        
        setChartData(stockLevelData);
        setTransactionsData(transactionsChartData);
        setStockDistribution(stockDistributionData);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [storeId, products, storeProducts]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Analytics</CardTitle>
        <CardDescription>
          Visualize inventory trends and stock levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        ) : (
          <Tabs defaultValue="levels">
            <TabsList className="mb-4">
              <TabsTrigger value="levels">Stock Levels</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="levels" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stock" fill="#8884d8" name="Current Stock" />
                  <Bar dataKey="minStock" fill="#FF8042" name="Minimum Stock" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="transactions" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={transactionsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="inflow" 
                    stroke="#00C49F" 
                    name="Stock Added" 
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="outflow" 
                    stroke="#FF8042" 
                    name="Stock Removed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="distribution" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stockDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} units`, 'Stock']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryAnalytics;
