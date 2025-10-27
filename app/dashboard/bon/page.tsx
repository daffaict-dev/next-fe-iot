"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, User, AlertTriangle, Package, CheckCircle, X } from "lucide-react";
import Cookies from "js-cookie";

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
  const searchParams = useSearchParams();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [purpose, setPurpose] = useState("");
  const [namaPengebon, setNamaPengebon] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State untuk alert simple
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [onAlertConfirm, setOnAlertConfirm] = useState<(() => void) | null>(null);

  const productId = searchParams.get('productId');

  // Get token dari cookies
  const getToken = (): string | undefined => {
    return Cookies.get("token");
  };

  // Fungsi untuk show alert
  const showSimpleAlert = (
    type: "success" | "error", 
    title: string, 
    message: string, 
    onConfirm?: () => void
  ) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setOnAlertConfirm(() => onConfirm);
    setShowAlert(true);
  };

  // Fetch product detail dari API
  const fetchProduct = async (): Promise<void> => {
    if (!productId) {
      showSimpleAlert('error', 'Error', 'Product ID tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        showSimpleAlert('error', 'Authentication Error', 'Token tidak ditemukan, silakan login kembali');
        setLoading(false);
        return;
      }
      
      const productRes = await fetch(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (productRes.ok) {
        const response = await productRes.json();
        const productData = response.data || response.product || response;
        
        if (productData && productData.id) {
          setSelectedProduct(productData);
        } else {
          showSimpleAlert('error', 'Data Error', 'Data produk tidak valid');
        }
      } else {
        showSimpleAlert('error', 'API Error', `Gagal memuat data produk: ${productRes.status}`);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      showSimpleAlert('error', 'Network Error', 'Terjadi kesalahan saat memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  // Handle quantity change dengan validasi
  const handleQuantityChange = (value: string): void => {
    const numValue = parseInt(value);
    
    if (value === "") {
      setQuantity("");
      return;
    }
    
    if (isNaN(numValue) || numValue < 1) {
      return;
    }
    
    if (selectedProduct && numValue > selectedProduct.jumlah) {
      setQuantity(selectedProduct.jumlah.toString());
    } else {
      setQuantity(value);
    }
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity || !purpose || !namaPengebon) {
      showSimpleAlert('error', 'Data Tidak Lengkap', 'Harap lengkapi semua field yang wajib diisi.');
      return;
    }

    const quantityNum = parseInt(quantity);
    
    if (quantityNum > selectedProduct.jumlah) {
      showSimpleAlert('error', 'Jumlah Melebihi Stok', 'Jumlah yang diambil tidak boleh melebihi stok tersedia.');
      return;
    }

    try {
      setSubmitting(true);
      
      const bonData = {
        product_id: selectedProduct.id,
        product_name: selectedProduct.nama_komponen,
        kode_barang: selectedProduct.kode_barang,
        quantity: quantityNum,
        purpose: purpose,
        nama_pengebon: namaPengebon,
        date: new Date().toISOString()
      };

      const token = getToken();
      const response = await fetch('/api/bon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bonData)
      });

      if (response.ok) {
        // Langsung refresh data produk setelah bon berhasil
        await fetchProduct();
        
        // Cek apakah masih overstock setelah refresh
        const stillOverstock = selectedProduct ? 
          (selectedProduct.jumlah - quantityNum) > selectedProduct.stok_max : false;
        
        if (stillOverstock) {
          showSimpleAlert(
            'success', 
            'Bon Berhasil Disimpan!', 
            `Bon pengambilan berhasil dibuat!\n\nAmbil: ${quantityNum} ${selectedProduct.satuan}\nSisa stok: ${selectedProduct.jumlah - quantityNum} ${selectedProduct.satuan}\n\nProduk ini masih memiliki stok berlebih.`,
            () => {
              // Reset form tapi tetap di halaman yang sama
              setQuantity("");
              setPurpose("");
              setNamaPengebon("");
            }
          );
        } else {
          showSimpleAlert(
            'success', 
            'Bon Berhasil Disimpan!', 
            `Bon pengambilan berhasil dibuat!\n\nAmbil: ${quantityNum} ${selectedProduct.satuan}\nSisa stok: ${selectedProduct.jumlah - quantityNum} ${selectedProduct.satuan}\n\nStok sudah normal.`,
            () => {
              router.push('/dashboard/analytics?section=overstock');
            }
          );
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan bon ke database');
      }

    } catch (error) {
      console.error("Error creating bon:", error);
      showSimpleAlert(
        'error', 
        'Gagal Menyimpan Bon', 
        error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan bon. Silakan coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch product on component mount
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Memuat data produk...</div>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <div className="text-white text-lg mb-4">Produk tidak ditemukan</div>
          <Button
            onClick={() => router.push('/dashboard/analytics')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Kembali ke Analytics
          </Button>
        </div>
      </div>
    );
  }

  const quantityNum = parseInt(quantity) || 0;
  const maxQuantity = selectedProduct.jumlah;
  const percentage = maxQuantity > 0 ? (quantityNum / maxQuantity) * 100 : 0;
  const isOverstock = selectedProduct.jumlah > selectedProduct.stok_max;

  return (
    <div className="flex-1 min-h-screen bg-gray-900">
      <main className="p-4 lg:p-6">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white w-full sm:w-auto justify-center sm:justify-start"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Buat Bon Pengambilan</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Form pengambilan komponen IoT</p>
            </div>
          </div>

          {/* Status Overstock Indicator */}
          {isOverstock && (
            <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-semibold text-yellow-300 text-sm sm:text-base">Status: Stok Berlebih</h4>
                  <p className="text-yellow-300 text-xs sm:text-sm mt-1">
                    Stok saat ini ({selectedProduct.jumlah}) melebihi batas maksimal ({selectedProduct.stok_max})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Product Information Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-white text-lg sm:text-xl">Informasi Komponen</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-gray-400 text-xs sm:text-sm">Nama Komponen:</span>
                    <p className="text-white font-medium text-sm sm:text-base truncate">{selectedProduct.nama_komponen}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs sm:text-sm">Kode Barang:</span>
                    <p className="text-white font-medium text-sm sm:text-base">{selectedProduct.kode_barang}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-gray-400 text-xs sm:text-sm">Stok Tersedia:</span>
                    <p className={`font-medium text-sm sm:text-base ${
                      isOverstock ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {selectedProduct.jumlah} {selectedProduct.satuan}
                      {isOverstock && ' ⚠️'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-xs sm:text-sm">Stok Maksimum:</span>
                    <p className="text-white font-medium text-sm sm:text-base">{selectedProduct.stok_max} {selectedProduct.satuan}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bon Form Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-white text-lg sm:text-xl">Form Pengambilan</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Nama Pengebon Field */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    Nama Pengebon *
                  </label>
                  <Input
                    value={namaPengebon}
                    onChange={(e) => setNamaPengebon(e.target.value)}
                    placeholder="Masukkan nama pengambil barang"
                    className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 h-10 sm:h-11"
                    required
                  />
                </div>

                {/* Quantity Field dengan Progress Indicator */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Jumlah yang Diambil *
                  </label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder="Masukkan jumlah"
                    className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 h-10 sm:h-11"
                    min="1"
                    max={maxQuantity}
                    required
                  />
                  
                  {/* Progress Indicator */}
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-400">Progress Pengambilan:</span>
                      <span className="font-medium text-white">
                        {quantityNum} / {maxQuantity} {selectedProduct.satuan}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 sm:h-2.5">
                      <div 
                        className={`rounded-full transition-all duration-500 ease-out ${
                          percentage > 80 ? 'bg-red-500' : 
                          percentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                        } ${percentage > 0 ? 'animate-pulse' : ''} h-2 sm:h-2.5`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Maksimal: {maxQuantity} {selectedProduct.satuan}</span>
                      {quantityNum > 0 && (
                        <span className={
                          quantityNum > maxQuantity ? 'text-red-400' : 'text-green-400'
                        }>
                          {quantityNum > maxQuantity ? 'Melebihi stok!' : 'Stok mencukupi'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Purpose Field */}
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">
                    Tujuan Pengambilan *
                  </label>
                  <Input
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Contoh: Untuk project IoT, maintenance, dll."
                    className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 h-10 sm:h-11"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white order-2 sm:order-1"
                    disabled={submitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white order-1 sm:order-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    disabled={
                      submitting || 
                      !quantity || 
                      !purpose || 
                      !namaPengebon || 
                      quantityNum > maxQuantity || 
                      quantityNum < 1
                    }
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Bon
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* SIMPLE ALERT - Tidak Pakai Component */}
      {showAlert && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div 
      className="absolute inset-0 bg-black/60"
      onClick={() => setShowAlert(false)}
    />
    
    {/* Alert Box */}
    <div 
      className="relative w-full max-w-md rounded-lg shadow-2xl"
      style={{
        backgroundColor: 'white',
        border: `2px solid ${alertType === 'success' ? '#10b981' : '#ef4444'}`,
      }}
    >
      
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{
          borderColor: '#e5e7eb'
        }}
      >
        <div className="flex items-center gap-3">
          {alertType === 'success' ? (
            <CheckCircle className="h-6 w-6" style={{ color: '#10b981' }} />
          ) : (
            <X className="h-6 w-6" style={{ color: '#ef4444' }} />
          )}
          <h3 
            className="font-bold text-lg"
            style={{
              color: alertType === 'success' ? '#065f46' : '#991b1b'
            }}
          >
            {alertTitle}
          </h3>
        </div>
        <button
          onClick={() => setShowAlert(false)}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold transition-colors duration-200"
        >
          ×
        </button>
      </div>
      
      {/* Body */}
      <div className="p-4">
        <p 
          className="text-base leading-relaxed whitespace-pre-line"
          style={{
            color: '#374151',
            lineHeight: '1.6'
          }}
        >
          {alertMessage}
        </p>
      </div>
      
      {/* Footer */}
      <div 
        className="flex justify-end gap-3 p-4 border-t rounded-b-lg"
        style={{
          borderColor: '#e5e7eb',
          backgroundColor: '#f9fafb'
        }}
      >
        <button
          onClick={() => {
            setShowAlert(false);
            onAlertConfirm?.();
          }}
          className="px-6 py-2 rounded font-medium text-white transition-all duration-200 hover:shadow-lg"
          style={{
            backgroundColor: alertType === 'success' ? '#10b981' : '#ef4444',
            minWidth: '80px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = alertType === 'success' ? '#059669' : '#dc2626';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = alertType === 'success' ? '#10b981' : '#ef4444';
          }}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}