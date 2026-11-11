import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/**"),
      new URL("https://cdn.nutrabay.com/**"),
      new URL("https://cdn2.nutrabay.com/**"),
    ],
  },
};

export default nextConfig;
