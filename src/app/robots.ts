import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/verify/report"],
    },
    sitemap: "https://cleancrypto.kr/sitemap.xml",
  };
}
