import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 lg:py-12">
        <p className="text-gray-400 text-base lg:text-lg">Tidak ada komponen ditemukan</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onCardClick={onProductClick}
        />
      ))}
    </div>
  );
}