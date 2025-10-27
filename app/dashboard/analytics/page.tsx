"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Edit,
  Download
} from "lucide-react";
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

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeSection, setActiveSection] = useState<'low-stock' | 'overstock'>('low-stock');
  const [loading, setLoading] = useState(true);

  // Get token dari cookies
  const getToken = () => {
    return Cookies.get("token");
  };

  // Fetch products dari API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        console.error("Token tidak ditemukan");
        return;
      }
      
      const productsRes = await fetch("/api/products", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const productsArray = productsData.data || productsData.products || productsData;
        
        if (Array.isArray(productsArray)) {
          setProducts(productsArray);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Set active section dari URL parameter
    const section = searchParams.get('section');
    if (section === 'low-stock' || section === 'overstock') {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Filter products berdasarkan section aktif
  const lowStockProducts = products.filter(p => p.jumlah <= p.stok_min);
  const overstockProducts = products.filter(p => p.jumlah > p.stok_max);
  
  const currentProducts = activeSection === 'low-stock' ? lowStockProducts : overstockProducts;

  const handleEditProduct = (productId: number) => {
    router.push(`/dashboard/components?edit=${productId}`);
  };

  const handleCreateBon = (product: Product) => {
    // Navigasi ke bon dengan product ID, tidak perlu simpan ke sessionStorage
    router.push(`/dashboard/bon?productId=${product.id}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Memuat data...</div>
      </div>
    );
  }

  // UI tetap sama, hanya data source yang berubah
  return (
    <div className="flex-1">
      <main className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Analytics</h1>
                <p className="text-gray-400 mt-1">
                  {activeSection === 'low-stock' 
                    ? 'Komponen dengan stok rendah' 
                    : 'Komponen dengan stok berlebih'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Section Toggle */}
          <div className="flex gap-2">
            <Button
              variant={activeSection === 'low-stock' ? "default" : "outline"}
              onClick={() => setActiveSection('low-stock')}
              className={`flex items-center gap-2 ${
                activeSection === 'low-stock' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Stok Rendah ({lowStockProducts.length})
            </Button>
            <Button
              variant={activeSection === 'overstock' ? "default" : "outline"}
              onClick={() => setActiveSection('overstock')}
              className={`flex items-center gap-2 ${
                activeSection === 'overstock' 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Stok Berlebih ({overstockProducts.length})
            </Button>
          </div>

          {/* Products List - UI tetap sama */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="px-6">
              <CardTitle className="text-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-xl">
                  {activeSection === 'low-stock' 
                    ? 'Komponen yang Perlu Restock' 
                    : 'Komponen dengan Stok Berlebih'
                  }
                </span>
                <span className="text-sm font-normal text-gray-400">
                  {currentProducts.length} item ditemukan
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {currentProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Tidak ada komponen
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {activeSection === 'low-stock'
                      ? 'Semua komponen memiliki stok yang cukup'
                      : 'Tidak ada komponen yang melebihi batas maksimal'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {currentProducts.map((product) => (
                    <Card key={product.id} className="bg-gray-750 border-gray-600">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Product Info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="font-semibold text-xl text-white">
                                {product.nama_komponen}
                              </h3>
                              <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                                {product.kode_barang}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="font-medium text-white">Jumlah:</span>
                                <span className={
                                  activeSection === 'low-stock' 
                                    ? 'text-red-400' 
                                    : 'text-yellow-400'
                                }>
                                  {product.jumlah} {product.satuan}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="font-medium text-white">Lokasi:</span>
                                <span>{product.lokasi_simpan}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="font-medium text-white">Stok Min:</span>
                                <span>{product.stok_min}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-300">
                                <span className="font-medium text-white">Stok Max:</span>
                                <span>{product.stok_max}</span>
                              </div>
                            </div>

                            <div className="text-xs text-gray-500">
                              Status: {activeSection === 'low-stock' 
                                ? '🟥 Stok kritis - perlu restock segera' 
                                : '🟨 Stok berlebih - pertimbangkan pengurangan'
                              }
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 justify-end lg:justify-start">
                            {activeSection === 'low-stock' ? (
                              <Button
                                onClick={() => handleEditProduct(product.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Update Stok
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleCreateBon(product)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Buat Bon
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats - tetap sama */}
          {/* ... */}
        </div>
      </main>
    </div>
  );
}