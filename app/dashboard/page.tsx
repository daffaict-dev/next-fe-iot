"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/user"); // cukup panggil proxy route
        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data.data);
      } catch (err) {
        console.error("Fetch user error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" }); // proxy logout
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      Cookies.remove("token");
      router.push("/login");
    }
  };

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {user ? (
        <>
          <p className="mt-4">Welcome back, {user.username} 🎉</p>
          <button
            onClick={handleLogout}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
          >
            Logout
          </button>
        </>
      ) : (
        <p className="mt-4 text-red-400">Gagal memuat data user</p>
      )}
    </div>
  );
}
