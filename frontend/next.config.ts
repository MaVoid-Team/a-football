import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async rewrites() {
    return [
      {
        source: "/rails/active_storage/:path*",
        destination: "http://app:3000/rails/active_storage/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
