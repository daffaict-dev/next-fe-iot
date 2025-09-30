// lib/api.ts
export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`http://127.0.0.1:8000${path}`, {
    ...options,
    credentials: "include", // biar cookie Sanctum ikut
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
