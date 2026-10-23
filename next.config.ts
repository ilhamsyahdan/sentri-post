import { withSentryConfig } from "@sentry/nextjs";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["unmarkable-wilmer-nonamenable.ngrok-free.dev"],

  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      { protocol: "https", hostname: "*.fbcdn.net", port: "", pathname: "/**" },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "sentri-post",
  project: "sentri-post",
  silent: !process.env.CI,
  widenClientFileUpload: true,

  bundleSizeOptimizations: {
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
  },

  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
