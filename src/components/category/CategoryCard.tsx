import * as React from "react";
import { Link } from "react-router-dom";
import { Category } from "@/data/models";
import { getProductsByCategory } from "@/data/models";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const [productCount, setProductCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const products = await getProductsByCategory(category.id);
        setProductCount(products.length);
      } catch (error) {
        console.error(`Error fetching products for category ${category.id}:`, error);
      }
    };
    
    fetchProductCount();
  }, [category.id]);

  return (
    <Link to={`/category/${category.id}`} className="block">
      <div className="overflow-hidden transition-transform transform bg-white border rounded-lg hover:shadow-md hover:scale-105">
        <div className="relative h-32 overflow-hidden bg-gray-100">
          <img
            src={category.image}
            alt={category.name}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-20 transition-opacity hover:bg-opacity-30">
            <h3 className="text-xl font-bold text-white">{category.name}</h3>
            {productCount !== null && (
              <p className="mt-1 text-sm text-white bg-black bg-opacity-30 px-2 py-1 rounded">
                {productCount} {productCount === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
