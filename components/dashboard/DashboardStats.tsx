"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  kode_barang: string;
  nama_komponen: string;
  jumlah: number;
  stok_min: number;
  stok_max: number;
}

interface DashboardStatsProps {
  products: Product[];
}

export function DashboardStats({ products }: DashboardStatsProps) {
  const router = useRouter();
  
  // Hitung statistik
  const lowStockProducts = products.filter(p => p.jumlah <= p.stok_min);
  const overstockProducts = products.filter(p => p.jumlah > p.stok_max);
  const adequateStockProducts = products.filter(p => p.jumlah > p.stok_min && p.jumlah <= p.stok_max);
  
  const lowStockCount = lowStockProducts.length;
  const overstockCount = overstockProducts.length;
  const adequateStockCount = adequateStockProducts.length;
  const totalProducts = products.length;

  // Handler untuk navigasi
  const handleTotalComponentsClick = () => {
    router.push('/dashboard/components');     
  };  

  const handleLowStockClick = () => {
    // Simpan data low stock products ke sessionStorage untuk digunakan di analytics
    sessionStorage.setItem('lowStockProducts', JSON.stringify(lowStockProducts));
    sessionStorage.setItem('activeSection', 'low-stock');
    router.push('/dashboard/analytics');
  };

  const handleOverstockClick = () => {
    // Simpan data overstock products ke sessionStorage untuk digunakan di analytics
    sessionStorage.setItem('overstockProducts', JSON.stringify(overstockProducts));
    sessionStorage.setItem('activeSection', 'overstock');
    router.push('/dashboard/analytics');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {/* Card 1: Total Komponen */}
      <Card 
        className="bg-gray-800 border-gray-700 hover:border-blue-500 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
        onClick={handleTotalComponentsClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Total Komponen
          </CardTitle>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-400" />
            <ArrowRight className="h-3 w-3 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalProducts}</div>
          <p className="text-xs text-gray-400">Jenis komponen IoT</p>
        </CardContent>
      </Card>

      {/* Card 2: Stok Rendah */}
      <Card 
        className="bg-gray-800 border-gray-700 hover:border-red-500 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
        onClick={handleLowStockClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Stok Rendah
          </CardTitle>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <ArrowRight className="h-3 w-3 text-red-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">{lowStockCount}</div>
          <p className="text-xs text-gray-400">Perlu restock</p>
          {lowStockCount > 0 && (
            <p className="text-xs text-red-300 mt-1">
              {lowStockCount} komponen perlu perhatian
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 3: Stok Berlebih */}
      <Card 
        className="bg-gray-800 border-gray-700 hover:border-yellow-500 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20"
        onClick={handleOverstockClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Stok Berlebih
          </CardTitle>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-yellow-400" />
            <ArrowRight className="h-3 w-3 text-yellow-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-400">{overstockCount}</div>
          <p className="text-xs text-gray-400">Melebihi batas maksimal</p>
          {overstockCount > 0 && (
            <p className="text-xs text-yellow-300 mt-1">
              {overstockCount} komponen berlebih
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}