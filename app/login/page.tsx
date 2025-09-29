// src/app/login/page.tsx atau pages/login.js

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Tidak digunakan lagi, tapi biar aman biarkan saja
import api from "@/axios";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter(); // Masih dipakai di sini, tapi fungsi redirect-nya dihilangkan.
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { username, password });

      if (res.data.success) {
        // Sesuaikan dengan struktur respons Laravel kamu: res.data.data
        const token = res.data.data.token;
        const name = res.data.data.name;

        // Hanya panggil login, redirect terjadi di AuthContext
        login(name, token);
        
        // 🔥 HAPUS BARIS INI (router.push("/dashboard"))
      } else {
        alert("Login gagal");
      }
    } catch (err) {
      alert("Login gagal, cek username & password");
      console.error("Login error:", err);
    }
  };

  return (
    // ... JSX form login
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-lg shadow-md border w-80 space-y-4"
      >
        {/* ... input fields ... */}
        <h1 className="text-xl font-bold text-center">Login</h1>
        <input
          type="text"
          placeholder="Username"
          className="w-full border rounded p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}