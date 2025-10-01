"use client";

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

export default function CardProduct({
  item,
  onClick,
}: {
  item: Product;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden text-white cursor-pointer hover:scale-[1.02] transition"
      onClick={onClick}
    >
      {/* Gambar full isi card */}
      <div className="w-full h-48 relative">
        {item.gambar ? (
          <img
            src={item.gambar}
            alt={item.nama_komponen}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">{item.nama_komponen}</h3>
        <p className="text-gray-300 text-sm mt-1">Kode: {item.kode_barang}</p>
        <p
          className={`mt-2 text-sm font-medium ${
            item.jumlah <= item.stok_min ? "text-red-400" : "text-green-400"
          }`}
        >
          Stok: {item.jumlah} {item.satuan}
        </p>
      </div>
    </div>
  );
}
