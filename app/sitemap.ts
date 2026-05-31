import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/content/blog";
import { SCAM_PLAYBOOKS } from "@/lib/content/scam-types";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const routes = ["", "/checker", "/onboarding", "/pricing", "/billing", "/report", "/blog", "/about", "/contact", "/privacy", "/terms", "/disclaimer", "/security", "/docs/api", "/threat-map", "/alerts", "/emergency", "/tools/url-inspector", "/tools/brand-inspector", "/tools/trust-widget", "/extension", "/scam-types", "/scam-database", "/reporting-directory"];
  return [
    ...routes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.8 })),
    ...BLOG_POSTS.map((post) => ({ url: `${baseUrl}/blog/${post.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...SCAM_PLAYBOOKS.map((playbook) => ({ url: `${baseUrl}/scam-types/${playbook.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.72 }))
  ];
}
