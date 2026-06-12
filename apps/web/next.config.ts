import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true";
const repositoryName = "soccer-intelligence";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  basePath: isStaticExport ? `/${repositoryName}` : undefined,
  assetPrefix: isStaticExport ? `/${repositoryName}/` : undefined,
  images: {
    unoptimized: isStaticExport
  },
  transpilePackages: ["@wci/contracts"],
  poweredByHeader: false
};

export default nextConfig;
