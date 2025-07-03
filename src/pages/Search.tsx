
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ProductGrid from "@/components/product/ProductGrid";
import { Product, searchProducts } from "@/data/models";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        if (query.trim()) {
          const results = await searchProducts(query);
          setProducts(results);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="container px-4 py-8 mx-auto">
      <Link to="/" className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-primary">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? "result" : "results"} found
        </p>
      </div>

      <ProductGrid
        products={products}
        isLoading={isLoading}
        emptyMessage={`No products found matching "${query}"`}
      />
    </div>
  );
};

export default Search;
