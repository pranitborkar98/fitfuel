import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitFuel, Personal Health Operating System",
    short_name: "FitFuel",
    description: "Verified meals, macros tracked, workouts logged, coaching built in. Pune.",
    start_url: "/",
    display: "standalone",
    background_color: "#080808",
    theme_color: "#080808",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
    ],
  };
}
