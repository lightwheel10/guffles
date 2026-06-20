// 2026-06-20: Single source of truth for the blog index list. Reads every
// app/blog/*/page.mdx and parses the scalar header of its `export const post = {...}`
// object. WHY: the index used to hand-maintain a separate POSTS array that drifted from
// the real posts (stale authors/dates/categories). Now the index is derived from the
// posts themselves, so it can never drift. Server-only (uses fs).

import fs from "fs";
import path from "path";

export interface BlogListItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // display, e.g. "Dec 18, 2025"
  readTime: string; // e.g. "8 min read"
  image: string;
  publishedAt: string; // ISO, used for sorting
}

const BLOG_DIR = path.join(process.cwd(), "app", "blog");

function strField(scope: string, key: string): string {
  const m = scope.match(new RegExp(`${key}\\s*:\\s*"([^"]*)"`));
  return m ? m[1] : "";
}

function numField(scope: string, key: string): number {
  const m = scope.match(new RegExp(`${key}\\s*:\\s*(\\d+)`));
  return m ? parseInt(m[1], 10) : 0;
}

// Format an ISO date in UTC so the displayed day matches publishedAt regardless of the
// build server's timezone (avoids off-by-one).
function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function getAllPosts(): BlogListItem[] {
  let entries: string[];
  try {
    entries = fs.readdirSync(BLOG_DIR);
  } catch {
    return [];
  }

  const items: BlogListItem[] = [];
  for (const name of entries) {
    const file = path.join(BLOG_DIR, name, "page.mdx");
    if (!fs.existsSync(file)) continue;

    const content = fs.readFileSync(file, "utf8");
    const start = content.indexOf("export const post");
    if (start === -1) continue;

    // Only parse the scalar header (everything before the nested arrays/objects), so a
    // nested `title`/`slug` inside relatedPosts/tableOfContents can't be picked up.
    let scope = content.slice(start);
    const cut = scope.search(/tableOfContents\s*:|faq\s*:|howTo\s*:|relatedPosts\s*:|extraSchemas\s*:/);
    if (cut !== -1) scope = scope.slice(0, cut);

    const title = strField(scope, "title");
    if (!title) continue;

    const publishedAt = strField(scope, "publishedAt");
    items.push({
      slug: strField(scope, "slug") || name,
      title,
      excerpt: strField(scope, "description"),
      category: strField(scope, "category") || "Uncategorized",
      date: formatDate(publishedAt),
      readTime: `${numField(scope, "readingTime") || 8} min read`,
      image: strField(scope, "featuredImage"),
      publishedAt,
    });
  }

  // Newest first.
  return items.sort((a, b) =>
    a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
  );
}

export function getAllCategories(posts: BlogListItem[]): string[] {
  return ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
}
