"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("token"); // ambil token dari cookie
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // kirim Bearer token
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.data); // BaseController -> sendResponse pakai "data"
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Fetch user error:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="p-10">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {user ? (
        <p className="mt-4">Welcome back, {user.username} 🎉</p>
      ) : (
        <p className="mt-4 text-red-400">Gagal memuat data user</p>
      )}
    </div>
  );
}
