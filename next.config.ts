import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Klasični portal skripti se sami vežejo na DOM; Strict Mode dvojni mount bi podvojil listenerje.
  reactStrictMode: false,
};

export default nextConfig;
