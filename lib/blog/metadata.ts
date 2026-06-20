// 2026-06-20: Builds the full Next.js Metadata (OpenGraph + Twitter + canonical)
// from the post object. WHY: NO existing post had OG/Twitter/canonical tags — only
// title + description. Generating them here makes every post share-ready and gives
// each a self-referencing canonical (non-www, matching app/sitemap.ts).
// See docs/BLOG_SEO_CHECKLIST.md.

import type { Metadata } from "next";
import { SITE_URL, AUTHOR, ORG, absoluteUrl } from "./config";
import type { PostMeta } from "./types";

export function buildPostMetadata(post: PostMeta): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = absoluteUrl(post.featuredImage);

  return {
    title: post.title,
    description: post.description,
    ...(post.keywords && post.keywords.length ? { keywords: post.keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      siteName: ORG.name,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [AUTHOR.name],
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
    },
  };
}
