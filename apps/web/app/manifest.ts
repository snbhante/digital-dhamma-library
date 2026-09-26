import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Digital Dhamma Library",
    short_name: "Dhamma Library",
    description: "Open Buddhist Digital Knowledge & Research Platform",
    start_url: ".",
    scope: ".",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#71552c",
    lang: "en",
  };
}
