import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/message",
  serverExternalPackages: ["xlsx"],
};

export default nextConfig;
