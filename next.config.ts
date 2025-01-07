import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: Partial<NextConfig> = {
  reactStrictMode: true,
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

// Use type assertion to resolve the type mismatch
const nextConfig = withPWAConfig(config as any);

export default nextConfig;
