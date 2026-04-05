import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string;
  author: string;
  category: "guide" | "analysis" | "news";
  tags: string[];
  thumbnail: string;
  readingTime: number;
  featured: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): Post {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const rt = readingTime(content);

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    updated: data.updated ?? data.date ?? "",
    author: data.author ?? "Clean Crypto 리서치팀",
    category: data.category ?? "guide",
    tags: data.tags ?? [],
    thumbnail: data.thumbnail ?? "/og-default.png",
    readingTime: Math.ceil(rt.minutes),
    featured: data.featured ?? false,
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  return getAllSlugs()
    .map((slug) => {
      const post = getPostBySlug(slug);
      const { content: _, ...meta } = post;
      return meta;
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}
