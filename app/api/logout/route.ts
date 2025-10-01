import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const res = await fetch(`${API_URL}/api/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  const response = NextResponse.json(await res.json(), { status: res.status });
  response.cookies.delete("token"); // hapus token
  return response;
}
