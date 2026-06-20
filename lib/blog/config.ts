// 2026-06-20: Central blog identity (site URL, author, organization) for Guffles.
// WHY: every post used to hand-duplicate its author + publisher inside JSON-LD,
// using fabricated personas ("Sarah Chen", "Growth Team") and a broken logo URL.
// Centralizing here means author/brand facts live in ONE place, every post stays
// consistent, and fixes (e.g. a real logo) apply everywhere at once.
// See docs/BLOG_SEO_CHECKLIST.md.

export const SITE_URL = "https://guffles.com";

// Real author, sourced from app/about/page.tsx (Paras Tiwari) — replaces the
// fabricated personas. NOTE: jobTitle inferred ("Founder") — confirm with owner.
export const AUTHOR = {
  name: "Paras Tiwari",
  jobTitle: "Founder, Guffles",
  bio: "Former ops at Amazon & Amex. Built Guffles to replace cold outreach with intent-based selling.",
  avatar: "/images/paras.jpeg",
  url: "https://www.linkedin.com/in/paras-tiwari-221a9b34b",
  sameAs: ["https://www.linkedin.com/in/paras-tiwari-221a9b34b"],
} as const;

export const ORG = {
  name: "Guffles",
  url: SITE_URL,
  // 2026-06-20: Publisher logo = the site's green "G" mark (app/icon.svg, served at
  // /icon.svg). Replaces the previously broken /logo.png reference that every post used.
  logo: `${SITE_URL}/icon.svg`,
} as const;

// Make a local path absolute (schema/OG require absolute URLs). Passes through
// values that are already absolute.
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
