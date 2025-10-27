"use client";

import { useEffect, useState } from "react";
import { ProductsSection } from "@/components/dashboard/ProductsSection";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ProductDetailModal } from "@/app/components/products/ProductDetailModal";
import Cookies from "js-cookie";

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
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const itemsPerPage = 8;

  // Get token dari cookies menggunakan js-cookie
  const getToken = () => {
    return Cookies.get("token");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getToken();
        
        if (!token) {
          setError("Token tidak ditemukan, silakan login kembali");
          setLoading(false);
          return;
        }
        
        const productsRes = await fetch("/api/products", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          // console.log("Products data:", productsData); // Debug log
          
          const productsArray = productsData.data || productsData.products || productsData;
          
          if (Array.isArray(productsArray)) {
            setProducts(productsArray);
            setFilteredProducts(productsArray);
          } else {
            setProducts([]);
            setFilteredProducts([]);
            setError("Format data tidak valid");
          }
        } else {
          const errorText = await productsRes.text();
          console.error("API Error:", productsRes.status, errorText);
          
          if (productsRes.status === 401) {
            setError("Token tidak valid, silakan login kembali");
          } else if (productsRes.status === 404) {
            setError("Endpoint API tidak ditemukan");
          } else {
            setError(`Gagal memuat data: ${productsRes.status} ${productsRes.statusText}`);
          }
        }
      } catch (err) {
        console.error("Fetch products error:", err);
        setError("Terjadi kesalahan saat memuat data");
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
      product.nama_komponen?.toLowerCase().includes(query.toLowerCase()) ||
      product.kode_barang?.toLowerCase().includes(query.toLowerCase()) ||
      product.lokasi_simpan?.toLowerCase().includes(query.toLowerCase())
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
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4 lg:space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="mt-2 text-red-300 hover:text-red-100 text-sm"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Stats Cards - HAPUS prop products */}
          <DashboardStats />

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