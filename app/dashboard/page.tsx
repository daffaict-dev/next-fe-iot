"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { Header } from "@/app/components/layout//Header";
import { SearchBar } from "@/app/components/search/SearchBar";
import { ProductGrid } from "@/app/components/products/ProductGrid";
import { Pagination } from "@/app/components/pagination/Pagination";
import { ProductDetailModal } from "../components/products/ProductDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle } from "lucide-react";

interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch user data
        const userRes = await fetch("/api/user");
        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        setUser(userData.data);

        // Fetch products data - GANTI DENGAN ENDPOINT API ANDA
        const productsRes = await fetch("/api/products", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          // Sesuaikan dengan struktur response API Anda
          setProducts(productsData.data || productsData.products || productsData);
          setFilteredProducts(productsData.data || productsData.products || productsData);
        } else {
          console.error("Failed to fetch products");
        }
      } catch (err) {
        console.error("Fetch data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      Cookies.remove("token");
      router.push("/login");
    }
  };

  // Tambahkan state untuk modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tambahkan function untuk handle product click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats
  const lowStockCount = products.filter(p => p.jumlah <= p.stok_min).length;
  const adequateStockCount = products.filter(p => p.jumlah > p.stok_min).length;
  const totalProducts = products.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="flex-1 p-4 lg:p-6 mt-14 lg:mt-0">
          <div className="space-y-4 lg:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Total Komponen
                  </CardTitle>
                  <Package className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{totalProducts}</div>
                  <p className="text-xs text-gray-400">Jenis komponen IoT</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Stok Rendah
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{lowStockCount}</div>
                  <p className="text-xs text-gray-400">Perlu restock</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Stok Cukup
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{adequateStockCount}</div>
                  <p className="text-xs text-gray-400">Stok memadai</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Products */}
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
              <SearchBar onSearch={handleSearch} />
              <ProductGrid 
                products={currentProducts} 
                onProductClick={handleProductClick}
              />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </CardContent>
            </Card>
          </div>
        </main>
        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
}