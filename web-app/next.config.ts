import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["algosdk"],
  // Handle ESM packages
  transpilePackages: ["@perawallet/connect"],
};

export default nextConfig;
