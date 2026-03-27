import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["gray-matter", "better-sqlite3"],
};

export default nextConfig;
