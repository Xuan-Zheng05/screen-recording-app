import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Google profile images
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },

      // Bunny
      {
        protocol: "https",
        hostname: "screen-recording-app-xuan.b-cdn.net",
        pathname: "/**",
      },
    ]
  }
};

export default nextConfig;
