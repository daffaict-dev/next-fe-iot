/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",                // Next.js /api/*
        destination: "http://127.0.0.1:8000/api/:path*", // Laravel backend
      },
    ];
  },
};

module.exports = nextConfig;
