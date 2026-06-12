import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@wci/contracts"],
  poweredByHeader: false
};

export default nextConfig;
