import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",

  allowedDevOrigins: [
    "192.168.1.13",
  ],

  images: {
    unoptimized: true
  }
};

export default nextConfig;
