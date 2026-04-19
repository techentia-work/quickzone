import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 🔹 Local backend (DEV)
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },

      // 🔹 Production backend
      {
        protocol: "https",
        hostname: "api.quickzon.in",
        pathname: "/**",
      },

      // 🔹 Cloudflare R2
      {
        protocol: "https",
        hostname: "pub-97716c4971834e8d95ee027c5df75d0b.r2.dev",
        pathname: "/**",
      },

      // 🔹 Cloudinary (legacy / fallback)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },

      // 🔹 External placeholder images
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
