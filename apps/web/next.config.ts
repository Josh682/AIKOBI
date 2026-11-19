import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@aikobi/product-matcher"],
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ...(config.resolve.extensionAlias ?? {}),
    };
    return config;
  },
};

export default nextConfig;
