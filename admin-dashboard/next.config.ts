import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 🔹 Backend API images
      {
        protocol: "https",
        hostname: "api.quickzon.in",
        pathname: "/**",
      },

      // 🔹 Cloudflare R2 public URL (agar direct use ho)
      {
        protocol: "https",
        hostname: "pub-97716c4971834e8d95ee027c5df75d0b.r2.dev", 
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**", // allow all Cloudinary image paths
      },
       {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
