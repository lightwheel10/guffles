// 2026-06-20: Generates JSON-LD (BlogPosting + FAQPage + HowTo) from the single
// `post` object. WHY: ~20 posts hand-wrote their own schema blocks (and 4 had none),
// causing drift and inconsistency. Generating from one source guarantees identical,
// correct structured data on every post, with the real author + publisher baked in.
// See docs/BLOG_SEO_CHECKLIST.md.

import { AUTHOR, ORG, SITE_URL, absoluteUrl } from "./config";
import type { PostMeta, FaqItem, HowTo } from "./types";

export function buildArticleSchema(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: absoluteUrl(post.featuredImage),
    author: {
      "@type": "Person",
      name: AUTHOR.name,
      jobTitle: AUTHOR.jobTitle,
      description: AUTHOR.bio,
      url: AUTHOR.url,
      worksFor: { "@type": "Organization", name: ORG.name, url: ORG.url },
      sameAs: AUTHOR.sameAs,
    },
    publisher: {
      "@type": "Organization",
      name: ORG.name,
      url: ORG.url,
      logo: { "@type": "ImageObject", url: ORG.logo },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    // 2026-06-20: mark the headline + intro paragraph as voice/AI-assistant readable.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".lead"],
    },
    articleSection: post.category,
    ...(post.keywords && post.keywords.length ? { keywords: post.keywords } : {}),
  };
}

export function buildFaqSchema(faq: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function buildHowToSchema(howTo: HowTo) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: howTo.name,
    ...(howTo.description ? { description: howTo.description } : {}),
    ...(howTo.totalTime ? { totalTime: howTo.totalTime } : {}),
    step: howTo.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

// 2026-06-20: Breadcrumb trail (Home > Blog > Post). Drives breadcrumb rich results
// and gives crawlers/AI the page's place in the site hierarchy.
export function buildBreadcrumbSchema(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };
}

// 2026-06-20: Sitewide brand entity. Lets Google/AI identify "Guffles" as an
// organization (knowledge panel, brand signals) and links it to the real founder.
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: ORG.name,
    url: ORG.url,
    logo: { "@type": "ImageObject", url: ORG.logo },
    description:
      "Intent-based lead discovery. Guffles finds people engaging with content about what you sell and turns those signals into warm leads.",
    founder: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
  };
}

// 2026-06-20: WebSite node (site name in results) + SearchAction (sitelinks search
// box). The urlTemplate points at /blog?q=..., which the blog index honors (see
// BlogIndexClient), so the action is real, not decorative.
export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: ORG.name,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
