import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/api/user`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
