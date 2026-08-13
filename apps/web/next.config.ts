import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Ensures ml_model_params.json is included in the serverless bundle
    // (needed for Vercel, Railway, Render, and other deployment platforms)
    outputFileTracingIncludes: {
      '/api/scrape': ['./app/api/scrape/ml_model_params.json'],
    },
  },
};

export default nextConfig;
