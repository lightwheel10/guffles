// 2026-06-20: Shared types for the blog post data object.
// WHY: each page.mdx now declares ONE typed `post` object as the single source of
// truth for that post (metadata, schema, TOC, FAQ). This kills the old drift between
// the per-post exports and the hardcoded index array.
// See docs/BLOG_SEO_CHECKLIST.md.

export interface TocItem {
  id: string;
  label: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export interface HowTo {
  name: string;
  description?: string;
  totalTime?: string; // ISO-8601 duration, e.g. "P2M"
  steps: HowToStep[];
}

export interface RelatedPost {
  slug: string;
  title: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string; // ISO date, e.g. "2025-12-16"
  updatedAt?: string; // ISO date of last meaningful update
  featuredImage: string; // local path, e.g. /images/blog/<slug>/header.png
  readingTime: number; // minutes
  tableOfContents?: TocItem[];
  // Single source of truth: renders BOTH the visible FAQ section and the FAQPage JSON-LD.
  faq?: FaqItem[];
  howTo?: HowTo;
  relatedPosts?: RelatedPost[];
  keywords?: string[];
  // 2026-06-20: raw JSON-LD objects for schema types the generic helpers don't build
  // (e.g. an ItemList "best X" ranking, a Product list, or a second HowTo). Injected
  // verbatim as <script type="application/ld+json"> by BlogPostLayout, so no post loses
  // structured data it already had.
  extraSchemas?: Record<string, unknown>[];
}
