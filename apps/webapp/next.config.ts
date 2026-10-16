import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.lhr.life",
    "*.loca.lt",
    "localhost:3000",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
