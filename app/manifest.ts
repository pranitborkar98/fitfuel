import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitFuel Pune",
    short_name: "FitFuel",
    description: "Chef-cooked meals connected to your nutrition target, delivery and diary in Pune.",
    start_url: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
    ],
  };
}
