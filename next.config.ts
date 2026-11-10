import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /* Trimmed from the Next default, which runs to nearly 4k: every homepage
       image already carries a sizes prop, and the widest slot on the page
       is a dish card at ~300px or a feature at ~54vw, so nothing on the
       homepage needs the largest default variant. Capping the list at 1920
       keeps the largest request a phone or laptop can actually use. */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      new URL("https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/**"),
      new URL("https://cdn.nutrabay.com/**"),
      new URL("https://cdn2.nutrabay.com/**"),
    ],
  },
};

export default nextConfig;
