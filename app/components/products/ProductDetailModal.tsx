import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  MapPin, 
  AlertTriangle, 
  Image, 
  Calendar,
  Tag,
  Box,
  Minus,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  if (!product) return null;

  const isLowStock = product.jumlah <= product.stok_min;
  const stockPercentage = (product.jumlah / product.stok_max) * 100;
  const createdDate = new Date(product.created_at).toLocaleDateString('id-ID');
  const updatedDate = new Date(product.updated_at).toLocaleDateString('id-ID');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl h-[90vh] sm:h-auto overflow-y-auto bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
            Detail Komponen
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-4">
          {/* Gambar Product */}
          <div className="space-y-4 order-2 lg:order-1">
            <div className="h-48 sm:h-64 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
              {product.gambar ? (
                <img 
                  src={product.gambar} 
                  alt={product.nama_komponen}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Image className="h-12 w-12 sm:h-16 sm:w-16 mb-2" />
                  <span className="text-sm">No Image Available</span>
                </div>
              )}
            </div>

            {/* Status Stok */}
            <div className="bg-gray-750 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Status Stok</span>
                <Badge 
                  variant={isLowStock ? "destructive" : "secondary"}
                  className={cn(
                    !isLowStock ? "bg-green-600 hover:bg-green-700" : "",
                    "text-xs sm:text-sm"
                  )}
                >
                  {isLowStock && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {isLowStock ? "Stok Rendah" : "Stok Cukup"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress Stok</span>
                  <span>{product.jumlah} / {product.stok_max}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stockPercentage > 50 
                        ? "bg-green-500" 
                        : stockPercentage > 20 
                        ? "bg-yellow-500" 
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Informasi Detail */}
          <div className="space-y-4 order-1 lg:order-2">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{product.nama_komponen}</h3>
              <p className="text-gray-400 text-sm">Kode: {product.kode_barang}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Box className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-300">Jumlah Stok</p>
                  <p className="text-white font-semibold truncate">
                    {product.jumlah} {product.satuan}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-300">Lokasi Penyimpanan</p>
                  <p className="text-white font-semibold truncate">{product.lokasi_simpan}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-300">Satuan</p>
                  <p className="text-white font-semibold truncate">{product.satuan}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
                <div className="bg-gray-750 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Minus className="h-3 w-3 text-red-400" />
                    <p className="text-xs text-gray-400">Stok Minimum</p>
                  </div>
                  <p className="text-white font-bold text-lg">{product.stok_min}</p>
                </div>

                <div className="bg-gray-750 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Plus className="h-3 w-3 text-green-400" />
                    <p className="text-xs text-gray-400">Stok Maksimum</p>
                  </div>
                  <p className="text-white font-bold text-lg">{product.stok_max}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 flex-shrink-0" />
                <p className="text-sm text-gray-300">Informasi Timeline</p>
              </div>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Dibuat pada:</span>
                  <span className="text-white">{createdDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Diupdate pada:</span>
                  <span className="text-white">{updatedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}