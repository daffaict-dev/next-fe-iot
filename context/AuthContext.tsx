// src/context/AuthContext.tsx

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // TAMBAH usePathname
import Cookies from 'js-cookie'; 

interface AuthContextType {
  user: string | null;
  token: string | null;
  login: (username: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Dapatkan path saat ini

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);

      // Kalau user login lalu buka /login → redirect ke dashboard
      if (pathname === "/login") {
        router.replace("/dashboard");
      }
    } else {
      // Kalau BELUM login → lempar ke login (kecuali udah di /login)
      if (pathname !== "/login") {
        router.replace("/login");
      }
    }
  }, [pathname, router]);


  const login = (username: string, token: string) => {
    setUser(username);
    setToken(token);
    
    // 1. Simpan di LocalStorage (untuk Client-side)
    localStorage.setItem("user", username);
    localStorage.setItem("token", token);
    
    // 2. Simpan di Cookie (untuk Server-side dan Middleware)
    Cookies.set('sanctum-token', token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    // 3. Lakukan Redirect ke Dashboard
    router.push("/dashboard"); 
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Hapus Cookie
    Cookies.remove('sanctum-token'); 
    
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};