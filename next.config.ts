import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'playwright',
    'playwright-core',
    'wallcrawler'
  ],
  webpack: (config) => {
    // Ignore playwright browser binaries
    config.externals.push({
      'playwright': 'commonjs playwright',
      'playwright-core': 'commonjs playwright-core',
    });
    
    return config;
  },
};

export default nextConfig;