"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Sidebar } from "@/app/components/layout/Sidebar";
import { DashboardHeader } from "@/components/dashboard";

interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userRes = await fetch("/api/user");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.data);
        }
      } catch (err) {
        console.error("Fetch user error:", err);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      Cookies.remove("token");
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <DashboardHeader user={user} onLogout={handleLogout} />
        {children}
      </div>
    </div>
  );
}