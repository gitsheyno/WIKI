import { dirname } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL(`${process.env.BLOB_BASE_URL}/**`)],
  },
  turbopack: {
    root: dirname(__filename),
  },
};

export default nextConfig;
