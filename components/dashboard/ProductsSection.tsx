import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBar } from "@/app/components/search/SearchBar";
import { ProductGrid } from "@/app/components/products/ProductGrid";
import { Pagination } from "@/app/components/pagination/Pagination";

interface Product {
  id: number;
  kode_barang: string;
  nama_komponen: string;
  gambar: string | null;
  satuan: string;
  jumlah: number;
  lokasi_simpan: string;
  stok_min: number;
  stok_max: number;
  created_at: string;
  updated_at: string;
}

interface ProductsSectionProps {
  filteredProducts: Product[];
  currentProducts: Product[];
  totalPages: number;
  currentPage: number;
  onSearch: (query: string) => void;
  onPageChange: (page: number) => void;
  onProductClick: (product: Product) => void;
}

export function ProductsSection({
  filteredProducts,
  currentProducts,
  totalPages,
  currentPage,
  onSearch,
  onPageChange,
  onProductClick
}: ProductsSectionProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="px-4 lg:px-6">
        <CardTitle className="text-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <span className="text-lg lg:text-xl">Daftar Komponen IoT</span>
          <span className="text-sm font-normal text-gray-400">
            {filteredProducts.length} item ditemukan
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 lg:px-6 pb-4 lg:pb-6">
        <SearchBar onSearch={onSearch} />
        <ProductGrid 
          products={currentProducts} 
          onProductClick={onProductClick}
        />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </CardContent>
    </Card>
  );
}