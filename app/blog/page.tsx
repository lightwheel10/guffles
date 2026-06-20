// 2026-06-20: Blog index is now a SERVER component. It loads the post list from the MDX
// files via getAllPosts() (single source of truth) and hands it to the client filter UI.
// The old hardcoded POSTS / CATEGORIES / FEATURED_POST arrays are gone — the index can no
// longer drift from the actual posts.

import { getAllPosts, getAllCategories } from "@/lib/blog/posts";
import { BlogIndexClient } from "@/components/blog/BlogIndexClient";
import { SITE_URL } from "@/lib/blog/config";

export const metadata = {
  title: "Blog — Guffles",
  description:
    "Playbooks and data on turning LinkedIn engagement into warm B2B leads.",
  alternates: { canonical: `${SITE_URL}/blog` },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const categories = getAllCategories(posts);
  return <BlogIndexClient posts={posts} categories={categories} />;
}
