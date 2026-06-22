import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Solo activa el analizador cuando ANALYZE=true — no afecta builds normales
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/7.x/initials/svg',
      }
    ]
  }
};

export default withBundleAnalyzer(nextConfig);
