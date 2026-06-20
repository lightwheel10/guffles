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
