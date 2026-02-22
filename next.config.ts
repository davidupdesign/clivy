import type { NextConfig } from "next";

const nextConfig = {
  serverExternalPackages: ["@prisma/client", "pg"],
};

export default nextConfig;
