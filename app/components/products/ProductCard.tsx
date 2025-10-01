import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, AlertTriangle, Image } from "lucide-react";
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

interface ProductCardProps {
  product: Product;
  onCardClick: (product: Product) => void;
}

export function ProductCard({ product, onCardClick }: ProductCardProps) {
  const isLowStock = product.jumlah <= product.stok_min;
  const stockPercentage = (product.jumlah / product.stok_max) * 100;

  return (
    <Card 
      className="w-full bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer hover:shadow-lg transform hover:-translate-y-1"
      onClick={() => onCardClick(product)}
    >
      <CardHeader className="pb-3 px-4 lg:px-6">
        {/* Gambar Product */}
        <div className="mb-3 h-32 sm:h-36 lg:h-40 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
          {product.gambar ? (
            <img 
              src={product.gambar} 
              alt={product.nama_komponen}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <Image className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mb-1 lg:mb-2" />
              <span className="text-xs sm:text-sm">No Image</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <CardTitle className="text-white text-base sm:text-lg flex items-center gap-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            <span className="line-clamp-2">{product.nama_komponen}</span>
          </CardTitle>
          <Badge 
            variant={isLowStock ? "destructive" : "secondary"}
            className={cn(
              "w-fit",
              !isLowStock ? "bg-green-600 hover:bg-green-700" : ""
            )}
          >
            {isLowStock && <AlertTriangle className="h-3 w-3 mr-1" />}
            {product.jumlah} {product.satuan}
          </Badge>
        </div>
        <p className="text-sm text-gray-400 mt-1">Kode: {product.kode_barang}</p>
      </CardHeader>
      <CardContent className="space-y-3 px-4 lg:px-6 pb-4 lg:pb-6">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="truncate">{product.lokasi_simpan}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Stok Level</span>
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
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>Min: {product.stok_min}</span>
          <span>Max: {product.stok_max}</span>
        </div>
      </CardContent>
    </Card>
  );
}