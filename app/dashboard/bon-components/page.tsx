"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/app/components/pagination/Pagination";
import { ArrowLeft, Save, User, Package, Search, Plus, Minus } from "lucide-react";
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

interface SelectedProduct extends Product {
  quantity: number;
}

export default function BonComponentsPage() {
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [namaPengebon, setNamaPengebon] = useState("");
  const [purpose, setPurpose] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  
  // State untuk alert
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  // Get token dari cookies
  const getToken = (): string | undefined => {
    return Cookies.get("token");
  };

  // Fetch semua produk
  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        showAlertMessage('Error', 'Token tidak ditemukan, silakan login kembali');
        return;
      }
      
      const productsRes = await fetch("/api/products", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (productsRes.ok) {
        const response = await productsRes.json();
        const productsArray = response.data || response.products || response;
        
        if (Array.isArray(productsArray)) {
          setProducts(productsArray);
          setFilteredProducts(productsArray);
        }
      } else {
        showAlertMessage('Error', 'Gagal memuat data produk');
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      showAlertMessage('Error', 'Terjadi kesalahan saat memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk show alert
  const showAlertMessage = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset ke page 1 saat search
    
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.nama_komponen?.toLowerCase().includes(query.toLowerCase()) ||
      product.kode_barang?.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredProducts(filtered);
  };

  // Toggle select product
  const toggleProductSelection = (product: Product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    
    if (isSelected) {
      // Remove product dari selected
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      // Add product ke selected dengan quantity default 1
      setSelectedProducts([
        ...selectedProducts,
        { ...product, quantity: 1 }
      ]);
    }
  };

  // Update quantity untuk selected product dengan input manual
  const updateQuantity = (productId: number, newQuantity: number | string) => {
    if (newQuantity === "" || newQuantity === null) {
      // Jika input dikosongkan, set ke 1
      setSelectedProducts(selectedProducts.map(product => 
        product.id === productId 
          ? { ...product, quantity: 1 }
          : product
      ));
      return;
    }

    const quantityNum = typeof newQuantity === 'string' ? parseInt(newQuantity) : newQuantity;
    
    if (isNaN(quantityNum) || quantityNum < 1) return;
    
    setSelectedProducts(selectedProducts.map(product => 
      product.id === productId 
        ? { ...product, quantity: Math.min(quantityNum, product.jumlah) }
        : product
    ));
  };

  // Handle input quantity change
  const handleQuantityInputChange = (productId: number, value: string) => {
    if (value === "") {
      updateQuantity(productId, "");
      return;
    }

    const quantityNum = parseInt(value);
    if (!isNaN(quantityNum) && quantityNum >= 1) {
      updateQuantity(productId, quantityNum);
    }
  };

  // Remove product dari selected
  const removeSelectedProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  // Validasi sebelum submit
  const validateForm = (): boolean => {
    if (!namaPengebon.trim()) {
      showAlertMessage('Data Tidak Lengkap', 'Harap isi nama pengebon');
      return false;
    }

    if (!purpose.trim()) {
      showAlertMessage('Data Tidak Lengkap', 'Harap isi tujuan pengambilan');
      return false;
    }

    if (selectedProducts.length === 0) {
      showAlertMessage('Data Tidak Lengkap', 'Harap pilih minimal 1 komponen');
      return false;
    }

    // Validasi quantity untuk setiap produk
    for (const product of selectedProducts) {
      if (product.quantity < 1) {
        showAlertMessage('Data Tidak Valid', `Quantity untuk ${product.nama_komponen} tidak boleh kurang dari 1`);
        return false;
      }
      
      if (product.quantity > product.jumlah) {
        showAlertMessage('Stok Tidak Cukup', `Stok ${product.nama_komponen} tidak mencukupi. Stok tersedia: ${product.jumlah}`);
        return false;
      }
    }

    return true;
  };

  // Fungsi untuk simpan ke localStorage (fallback)
const saveToLocalStorage = (bonData: any) => {
  try {
    const existingBons = JSON.parse(localStorage.getItem('multiple_bons') || '[]');
    const newBon = {
      id: Date.now(),
      ...bonData,
      created_at: new Date().toISOString()
    };
    
    existingBons.push(newBon);
    localStorage.setItem('multiple_bons', JSON.stringify(existingBons));
    return { success: true, data: newBon };
    } catch (error) {
    console.error('Error saving to localStorage:', error);
    return { success: false, message: 'Gagal menyimpan ke localStorage' };
    }
   };


  // Handle submit form
  // Handle submit form
const handleSubmit = async (e: React.FormEvent): Promise<void> => {
  e.preventDefault();
  
  if (!validateForm()) return;

  try {
    setSubmitting(true);
    
    const bonData = {
      nama_pengebon: namaPengebon,
      purpose: purpose,
      items: selectedProducts.map(product => ({
        product_id: product.id,
        product_name: product.nama_komponen,
        kode_barang: product.kode_barang,
        quantity: product.quantity,
        satuan: product.satuan
      })),
      date: new Date().toISOString()
    };

    const token = getToken();
    let result;

    // Debug logging
    console.log('Submitting bon data:', bonData);
    console.log('Token:', token ? 'Available' : 'Missing');

    if (token) {
      // Coba kirim ke API
      const response = await fetch('/api/bon/multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bonData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        result = await response.json();
      } else {
        // Fallback ke localStorage jika API error
        console.warn('API failed, falling back to localStorage');
        result = saveToLocalStorage(bonData);
      }
    } else {
      // Simpan ke localStorage jika tidak ada token
      result = saveToLocalStorage(bonData);
    }

    if (result.success) {
      showAlertMessage(
        'Bon Berhasil Disimpan!', 
        `Bon pengambilan berhasil dibuat untuk ${selectedProducts.length} komponen.\n\nPengebon: ${namaPengebon}\nTujuan: ${purpose}`
      );
      
      // Reset form setelah success
      setSelectedProducts([]);
      setNamaPengebon("");
      setPurpose("");
      
      // Refresh data produk
      await fetchProducts();
    } else {
      throw new Error(result.message || 'Gagal menyimpan bon');
    }

  } catch (error) {
    console.error("Error creating bon:", error);
    showAlertMessage(
      'Gagal Menyimpan Bon', 
      error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan bon. Silakan coba lagi.'
    );
  } finally {
    setSubmitting(false);
  }
};

  // Total quantity dan items
  const totalItems = selectedProducts.length;
  const totalQuantity = selectedProducts.reduce((sum, product) => sum + product.quantity, 0);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Memuat data komponen...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-900">
      <main className="p-4 lg:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
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
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Buat Bon Multiple Komponen</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Pilih multiple komponen untuk satu bon pengambilan</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Section */}
            <div className="space-y-6">
              {/* Informasi Bon */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Informasi Bon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-400" />
                      Nama Pengebon *
                    </label>
                    <Input
                      value={namaPengebon}
                      onChange={(e) => setNamaPengebon(e.target.value)}
                      placeholder="Masukkan nama pengambil barang"
                      className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">
                      Tujuan Pengambilan *
                    </label>
                    <Input
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Contoh: Untuk project IoT, maintenance, dll."
                      className="bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Komponen Terpilih</span>
                      <span className="text-sm font-normal text-gray-400">
                        {totalItems} item • {totalQuantity} total
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg border border-gray-600">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white truncate">{product.nama_komponen}</h4>
                          <p className="text-sm text-gray-400">{product.kode_barang}</p>
                          <p className="text-xs text-gray-500">Stok: {product.jumlah} {product.satuan}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(product.id, product.quantity - 1)}
                            className="h-8 w-8 border-gray-600 text-gray-300"
                            disabled={product.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          {/* Input Quantity - Bisa Diketik */}
                          <Input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => handleQuantityInputChange(product.id, e.target.value)}
                            min="1"
                            max={product.jumlah}
                            className="w-16 h-8 text-center bg-gray-700 border-gray-600 text-white text-sm"
                          />
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(product.id, product.quantity + 1)}
                            className="h-8 w-8 border-gray-600 text-gray-300"
                            disabled={product.quantity >= product.jumlah}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeSelectedProduct(product.id)}
                            className="h-8 w-8 border-red-600 text-red-400 hover:bg-red-600/20"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Products List */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Daftar Komponen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Cari komponen..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                {/* Products List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {currentProducts.map((product) => {
                    const isSelected = selectedProducts.some(p => p.id === product.id);
                    const isOutOfStock = product.jumlah === 0;
                    
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-600/20 border-blue-500' 
                            : isOutOfStock
                            ? 'bg-gray-700/50 border-gray-600 cursor-not-allowed'
                            : 'bg-gray-750 border-gray-600 hover:border-blue-500/50'
                        }`}
                        onClick={() => !isOutOfStock && toggleProductSelection(product)}
                      >
                        {/* Custom Checkbox */}
                        <div 
                          className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600 text-white' 
                              : isOutOfStock
                              ? 'bg-gray-600 border-gray-500 cursor-not-allowed'
                              : 'bg-gray-700 border-gray-500 hover:border-blue-500 cursor-pointer'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            !isOutOfStock && toggleProductSelection(product);
                          }}
                        >
                          {isSelected && (
                            <svg className="h-2 w-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium ${
                            isOutOfStock ? 'text-gray-500' : 'text-white'
                          } truncate`}>
                            {product.nama_komponen}
                          </h4>
                          <p className="text-sm text-gray-400">{product.kode_barang}</p>
                          <p className={`text-xs ${
                            isOutOfStock ? 'text-red-400' : 'text-gray-500'
                          }`}>
                            Stok: {product.jumlah} {product.satuan}
                            {isOutOfStock && ' • Stok habis'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {currentProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Package className="h-12 w-12 mx-auto mb-2" />
                      <p>Tidak ada komponen yang ditemukan</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-700 pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          {selectedProducts.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <div className="text-white">
                    <p className="font-medium">{totalItems} komponen terpilih</p>
                    <p className="text-sm text-gray-400">Total quantity: {totalQuantity}</p>
                  </div>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !namaPengebon || !purpose}
                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Bon ({totalItems} komponen)
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Alert */}
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAlert(false)} />
          <div 
            className="relative w-full max-w-md rounded-lg shadow-2xl"
            style={{
              backgroundColor: 'white',
              border: '2px solid #10b981',
            }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="font-bold text-lg" style={{ color: '#065f46' }}>
                {alertTitle}
              </h3>
              <button
                onClick={() => setShowAlert(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-4">
              <p className="text-base leading-relaxed whitespace-pre-line" style={{ color: '#374151' }}>
                {alertMessage}
              </p>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t rounded-b-lg" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
              <button
                onClick={() => setShowAlert(false)}
                className="px-6 py-2 rounded font-medium text-white transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: '#10b981', minWidth: '80px' }}
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