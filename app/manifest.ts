import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrustCheck AI",
    short_name: "TrustCheck",
    description: "AI-powered scam detection, alerts, public intelligence and business safety tools.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0EA5E9",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/brand/trustcheck-mark.svg", sizes: "256x256", type: "image/svg+xml", purpose: "any" }
    ]
  };
}
