import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProductGrid from "@/components/product/ProductGrid";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { ChevronLeft } from "lucide-react";

const Category = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const categoryObj = categories.find((cat) => cat.id === id);
        if (categoryObj) {
          setCategory(categoryObj.name);
        }
        
        const data = await getProductsByCategory(id);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center mb-4 text-sm text-gray-600 hover:text-primary">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        <h1 className="mb-2 text-3xl font-bold">{category || "Category"}</h1>
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? "product" : "products"} available
        </p>
      </div>

      {/* Filters could go here */}

      <ProductGrid
        products={products}
        isLoading={isLoading}
        emptyMessage="No products found in this category"
      />
    </div>
  );
};

export default Category;
