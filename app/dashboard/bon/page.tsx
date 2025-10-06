"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Save } from "lucide-react";

interface Product {
  id: number;
  kode_barang: string;
  nama_komponen: string;
  satuan: string;
  jumlah: number;
  stok_min: number;
  stok_max: number;
}

export default function BonPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    const productData = sessionStorage.getItem('selectedProductForBon');
    if (productData) {
      setSelectedProduct(JSON.parse(productData));
    } else {
      router.push('/dashboard/analytics');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || !purpose) {
      alert("Harap lengkapi semua field");
      return;
    }

    // Simpan data bon (ini bisa disesuaikan dengan API Anda)
    const bonData = {
      productId: selectedProduct.id,
      productName: selectedProduct.nama_komponen,
      quantity: parseInt(quantity),
      purpose: purpose,
      date: new Date().toISOString()
    };

    // Simpan ke localStorage atau kirim ke API
    localStorage.setItem('lastBon', JSON.stringify(bonData));
    
    alert("Bon berhasil dibuat!");
    router.push('/dashboard/analytics');
  };

  if (!selectedProduct) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-white text-lg">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <main className="p-4 lg:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
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
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Buat Bon Pengambilan</h1>
              <p className="text-gray-400 mt-1">Form pengambilan komponen IoT</p>
            </div>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Informasi Komponen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Nama Komponen:</span>
                  <p className="text-white font-medium">{selectedProduct.nama_komponen}</p>
                </div>
                <div>
                  <span className="text-gray-400">Kode Barang:</span>
                  <p className="text-white font-medium">{selectedProduct.kode_barang}</p>
                </div>
                <div>
                  <span className="text-gray-400">Stok Tersedia:</span>
                  <p className="text-yellow-400 font-medium">{selectedProduct.jumlah} {selectedProduct.satuan}</p>
                </div>
                <div>
                  <span className="text-gray-400">Stok Maksimum:</span>
                  <p className="text-white font-medium">{selectedProduct.stok_max} {selectedProduct.satuan}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Form Pengambilan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Jumlah yang Diambil *
                  </label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Masukkan jumlah"
                    className="bg-gray-700 border-gray-600 text-white"
                    min="1"
                    max={selectedProduct.jumlah}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Maksimal: {selectedProduct.jumlah} {selectedProduct.satuan}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Tujuan Pengambilan *
                  </label>
                  <Input
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Contoh: Untuk project IoT, maintenance, dll."
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Bon
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}