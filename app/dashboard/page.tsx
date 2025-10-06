"use client";

import { useEffect, useState } from "react";
import { ProductsSection } from "@/components/dashboard/ProductsSection";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ProductDetailModal } from "@/app/components/products/ProductDetailModal";

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

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
        
        const productsRes = await fetch("/api/products", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const productsArray = productsData.data || productsData.products || productsData;
          setProducts(productsArray);
          setFilteredProducts(productsArray);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (err) {
        console.error("Fetch products error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.nama_komponen.toLowerCase().includes(query.toLowerCase()) ||
      product.kode_barang.toLowerCase().includes(query.toLowerCase()) ||
      product.lokasi_simpan.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
          {/* Stats Cards */}
          <DashboardStats products={products} />

          {/* Search and Products */}
          <ProductsSection
            filteredProducts={filteredProducts}
            currentProducts={currentProducts}
            totalPages={totalPages}
            currentPage={currentPage}
            onSearch={handleSearch}
            onPageChange={setCurrentPage}
            onProductClick={handleProductClick}
          />
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}