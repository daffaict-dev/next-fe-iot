"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  X,
  ArrowLeft,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import Cookies from "js-cookie";
import { Pagination } from "@/app/components/pagination/Pagination";

export interface Product {
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

export default function ComponentsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [formData, setFormData] = useState({
    kode_barang: "",
    nama_komponen: "",
    satuan: "",
    jumlah: 0,
    lokasi_simpan: "",
    stok_min: 0,
    stok_max: 0,
    gambar: null as string | null,
  });

  // Get token from cookies
  const getToken = () => {
    return Cookies.get("token");
  };

  // Fetch products dengan token
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
          'Content-Type': 'application/json'
        }
      });
      
      if (!productsRes.ok) {
        if (productsRes.status === 401) {
          setError("Token tidak valid, silakan login kembali");
        } else {
          throw new Error(`HTTP error! status: ${productsRes.status}`);
        }
        return;
      }
      
      const productsData = await productsRes.json();
      
      // Mengikuti pola dari contoh: productsData.data || productsData.products || productsData
      const productsArray = productsData.data || productsData.products || productsData;
      
      
      // Pastikan productsArray adalah array
      if (Array.isArray(productsArray)) {
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } else {
        console.warn('Expected array but got:', typeof productsArray);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Gagal memuat data komponen");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchTerm(query);
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

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          gambar: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      gambar: null
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      kode_barang: "",
      nama_komponen: "",
      satuan: "",
      jumlah: 0,
      lokasi_simpan: "",
      stok_min: 0,
      stok_max: 0,
      gambar: null,
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  // Handle form submit dengan token
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      if (!token) {
        setError("Token tidak ditemukan, silakan login kembali");
        return;
      }

      const url = editingProduct 
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      
      const method = editingProduct ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        resetForm();
        fetchProducts();
      } else {
        if (response.status === 401) {
          setError("Token tidak valid, silakan login kembali");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal menyimpan komponen");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan");
    }
  };

  // Handle edit
  const handleEdit = (product: Product) => {
    setFormData({
      kode_barang: product.kode_barang,
      nama_komponen: product.nama_komponen,
      satuan: product.satuan,
      jumlah: product.jumlah,
      lokasi_simpan: product.lokasi_simpan,
      stok_min: product.stok_min,
      stok_max: product.stok_max,
      gambar: product.gambar,
    });
    setEditingProduct(product);
    setShowForm(true);
  };

  // Handle delete dengan token
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus komponen ini?")) return;

    try {
      const token = getToken();
      if (!token) {
        setError("Token tidak ditemukan, silakan login kembali");
        return;
      }

      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchProducts();
      } else {
        if (response.status === 401) {
          setError("Token tidak valid, silakan login kembali");
        } else {
          console.error("Error deleting product");
          setError("Gagal menghapus komponen");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Terjadi kesalahan saat menghapus");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Memuat data komponen...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header dengan Back Button */}
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
              <h1 className="text-3xl font-bold text-white">Manajemen Komponen</h1>
              <p className="text-gray-400 mt-1">Kelola komponen inventory IoT</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Tambah Komponen
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Search Bar */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Cari komponen berdasarkan nama, kode, atau lokasi..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-lg lg:text-xl">Daftar Komponen IoT</span>
              <span className="text-sm font-normal text-gray-400">
                {filteredProducts.length} item ditemukan
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {currentProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchTerm ? "Tidak ada komponen yang ditemukan" : "Tidak ada komponen"}
                  </h3>
                  <p className="text-gray-400 mb-4">
                    {searchTerm 
                      ? "Coba ubah kata kunci pencarian Anda" 
                      : "Mulai dengan menambahkan komponen pertama Anda"
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setShowForm(true)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Komponen Pertama
                    </Button>
                  )}
                </div>
              ) : (
                currentProducts.map((product) => (
                  <Card key={product.id} className="bg-gray-750 border-gray-600 hover:border-blue-500/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Gambar Komponen */}
                        <div className="flex-shrink-0">
                          {product.gambar ? (
                            <img 
                              src={product.gambar} 
                              alt={product.nama_komponen}
                              className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-lg border border-gray-600"
                            />
                          ) : (
                            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                        </div>

                        {/* Info Komponen */}
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="font-semibold text-xl text-white">{product.nama_komponen}</h3>
                            <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                              {product.kode_barang}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="font-medium text-white">Jumlah:</span>
                              <span>{product.jumlah} {product.satuan}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="font-medium text-white">Lokasi:</span>
                              <span>{product.lokasi_simpan}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="font-medium text-white">Stok Min:</span>
                              <span className={product.jumlah <= product.stok_min ? "text-red-400" : "text-green-400"}>
                                {product.stok_min}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <span className="font-medium text-white">Stok Max:</span>
                              <span>{product.stok_max}</span>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500">
                            Terakhir update: {new Date(product.updated_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 self-end lg:self-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="border-blue-500 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="border-red-500 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-700">
              <CardTitle className="flex items-center gap-2 text-white">
                <Package className="h-5 w-5 text-blue-400" />
                {editingProduct ? "Edit Komponen" : "Tambah Komponen Baru"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload Gambar */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Gambar Komponen</label>
                  <div className="flex items-center gap-4">
                    {formData.gambar ? (
                      <div className="relative">
                        <img 
                          src={formData.gambar} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="h-8 w-8 text-gray-500" />
                        <span className="text-xs text-gray-400 text-center px-2">No Image</span>
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        id="gambar"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="gambar">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {formData.gambar ? "Ganti Gambar" : "Upload Gambar"}
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Kode Barang *</label>
                    <Input
                      value={formData.kode_barang}
                      onChange={(e) => setFormData({...formData, kode_barang: e.target.value})}
                      placeholder="Masukkan kode barang..."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Nama Komponen *</label>
                    <Input
                      value={formData.nama_komponen}
                      onChange={(e) => setFormData({...formData, nama_komponen: e.target.value})}
                      placeholder="Masukkan nama komponen..."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Satuan *</label>
                    <Input
                      value={formData.satuan}
                      onChange={(e) => setFormData({...formData, satuan: e.target.value})}
                      placeholder="Contoh: pcs, unit, pack..."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Jumlah *</label>
                    <Input
                      type="number"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({...formData, jumlah: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Lokasi Simpan *</label>
                    <Input
                      value={formData.lokasi_simpan}
                      onChange={(e) => setFormData({...formData, lokasi_simpan: e.target.value})}
                      placeholder="Masukkan lokasi penyimpanan..."
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Stok Minimum *</label>
                    <Input
                      type="number"
                      value={formData.stok_min}
                      onChange={(e) => setFormData({...formData, stok_min: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Stok Maksimum *</label>
                    <Input
                      type="number"
                      value={formData.stok_max}
                      onChange={(e) => setFormData({...formData, stok_max: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-700">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingProduct ? "Update Komponen" : "Simpan Komponen"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}