import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@partner-portal/shared", "@partner-portal/ui"],
};

export default nextConfig;
