import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Seasoned",
    short_name: "Seasoned",
    description: "Your personal chef instructor.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#faf8f5",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
