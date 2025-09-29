"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/axios";
import Cookies from 'js-cookie'; 

export default function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Kalau gak ada token, langsung lempar ke login
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await api.get("/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data.data);
      } catch (err) {
        console.error("Gagal fetch products:", err);
      }
    };

    fetchProducts();
  }, [router]);

  const handleLogout = () => {
    // hapus token dari localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
          
          // Hapus Cookie
    Cookies.remove('sanctum-token'); 
    // redirect ke login
    router.push("/login");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition text-white shadow-lg"
        >
          Logout
        </button>
      </div>

      {/* Card Produk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden cursor-pointer hover:scale-[1.02] transition"
          >
            <div className="w-full h-48">
              <img
                src={item.gambar || "/placeholder.png"}
                alt={item.nama_komponen}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold truncate">
                {item.nama_komponen}
              </h3>
              <p className="text-gray-300 text-sm mt-1">
                {item.kode_barang} • {item.jumlah} {item.satuan}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
