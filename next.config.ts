import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = "sepanta-co";

// Allow explicit override for local static preview: NEXT_PUBLIC_BASE_PATH="" npm run build
const rawBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : isProd
      ? `/${repoName}`
      : "";

const normalizedBasePath = rawBasePath.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: normalizedBasePath || undefined,
  assetPrefix: normalizedBasePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: normalizedBasePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
