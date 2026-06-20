// 2026-06-20: Shared blog post frame for Guffles.
// WHY: every post used to re-declare ~50 lines of identical page shell (Navbar,
// sticky TOC, sidebars, Footer) AND hand-write its own JSON-LD + author block. This
// component centralizes the shell and injects all SEO (JSON-LD generated from the
// single `post` object, real author from lib/blog/config). A post now supplies only
// data + body. Server component so the HTML + JSON-LD are server-rendered for SEO.
// See docs/BLOG_SEO_CHECKLIST.md.

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import {
  StickyTableOfContents,
  SidebarResource,
  SidebarQuickWins,
  SidebarMore,
} from "@/components/blog/blocks";
import { AUTHOR } from "@/lib/blog/config";
import { buildArticleSchema, buildFaqSchema, buildHowToSchema } from "@/lib/blog/schema";
import type { PostMeta } from "@/lib/blog/types";

// Server-rendered with a fixed input date, so this is deterministic (no hydration mismatch).
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BlogPostLayout({
  post,
  children,
}: {
  post: PostMeta;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">

      {/* JSON-LD — generated from the single `post` object (2026-06-20) */}
      <JsonLd data={buildArticleSchema(post)} />
      {post.faq && post.faq.length > 0 && <JsonLd data={buildFaqSchema(post.faq)} />}
      {post.howTo && <JsonLd data={buildHowToSchema(post.howTo)} />}
      {/* 2026-06-20: extra raw JSON-LD a post carries (ItemList / Product list / 2nd HowTo) */}
      {post.extraSchemas?.map((s, i) => <JsonLd key={`extra-${i}`} data={s} />)}

      <Navbar />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pb-24 relative z-10 pt-24 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px] gap-12 pt-8">

          {/* LEFT: sticky table of contents */}
          <aside className="hidden lg:block relative h-full">
            <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar pb-10">
              {post.tableOfContents && post.tableOfContents.length > 0 && (
                <StickyTableOfContents items={post.tableOfContents} />
              )}
            </div>
          </aside>

          {/* CENTER: article */}
          <main className="max-w-3xl mx-auto lg:mx-0 w-full min-w-0">

            <header className="mb-12 animate-fade-in-up">
              {/* Category badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                {post.category}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground mb-6 text-balance">
                {post.title}
              </h1>

              {/* Author + meta — real author from lib/blog/config (2026-06-20) */}
              <div className="flex items-center gap-4 py-6 border-y border-border/50">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden ring-1 ring-white/10">
                    <Image
                      src={AUTHOR.avatar}
                      alt={AUTHOR.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-foreground">{AUTHOR.name}</div>
                  <div className="text-sm text-muted-foreground">{AUTHOR.jobTitle}</div>
                </div>
                <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
                <div className="hidden sm:flex flex-col text-sm text-muted-foreground">
                  {/* 2026-06-20: show ONLY the "Updated" date publicly (per request) — the
                      published date is intentionally not displayed. It still lives in the
                      JSON-LD `datePublished` (in schema.ts) for SEO/freshness signals. */}
                  <span>Updated {formatDate(post.updatedAt || post.publishedAt)}</span>
                  <span>{post.readingTime} min read</span>
                </div>
              </div>
            </header>

            {/* Featured image */}
            <div
              className="relative mb-12 rounded-2xl overflow-hidden shadow-2xl bg-muted aspect-[16/9] animate-fade-in-up"
              style={{ animationDelay: "100ms" }}
            >
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Article body (MDX content supplied by the post) */}
            <article className="prose prose-lg dark:prose-invert prose-headings:scroll-mt-32 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg max-w-none">
              {children}
            </article>

            {/* Related reading — internal linking for crawl discovery (2026-06-20) */}
            {post.relatedPosts && post.relatedPosts.length > 0 && (
              <nav className="mt-16 border-t border-border/50 pt-8" aria-label="Related articles">
                <h2 className="text-xl font-bold mb-4">Related reading</h2>
                <ul className="space-y-2">
                  {post.relatedPosts.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/blog/${r.slug}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </main>

          {/* RIGHT: sticky sidebar */}
          <aside className="hidden xl:block relative h-full">
            <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar space-y-8 pb-10">
              <SidebarResource />
              <SidebarQuickWins />
              <SidebarMore />
            </div>
          </aside>

        </div>
      </div>

      <Footer />
    </div>
  );
}
