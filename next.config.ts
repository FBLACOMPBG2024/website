import type { NextConfig } from "next";
import withPWA from "next-pwa";

const config: Partial<NextConfig> = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

// Use type assertion to resolve the type mismatch
const nextConfig = withPWAConfig(config as any);

export default nextConfig;
