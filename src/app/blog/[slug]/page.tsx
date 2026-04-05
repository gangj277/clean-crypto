import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { getAllSlugs, getPostBySlug, getAllPosts } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/mdx-components";
import { PostHeader, PostFooterCta, BlogCard } from "@/components/blog/post-layout";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return {
      title: `${post.title} | Clean Crypto 블로그`,
      description: post.description,
      keywords: post.tags,
      openGraph: {
        title: post.title,
        description: post.description,
        type: "article",
        publishedTime: post.date,
        modifiedTime: post.updated,
        authors: [post.author],
        locale: "ko_KR",
      },
      alternates: {
        canonical: `/blog/${slug}`,
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const { content: mdxContent } = await compileMDX({
    source: post.content,
    components: mdxComponents,
  });

  /* related posts: same category, exclude self */
  const allPosts = getAllPosts();
  const related = allPosts
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, 2);

  /* JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Clean Crypto" },
    datePublished: post.date,
    dateModified: post.updated,
    mainEntityOfPage: `https://cleancrypto.kr/blog/${slug}`,
    inLanguage: "ko",
    articleSection: post.category,
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 card-glass border-b border-white/40">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-5 h-14">
          <a href="/" className="font-bold text-lg tracking-tight text-foreground">
            Clean Crypto
          </a>
          <div className="flex items-center gap-5">
            <a href="/blog" className="text-sm font-semibold text-muted hover:text-foreground transition-colors">블로그</a>
            <a href="/verify" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">검증하기</a>
          </div>
        </div>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-2xl px-5 pt-10 pb-20">
        {/* breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-muted mb-6">
          <a href="/" className="hover:text-foreground transition-colors">홈</a>
          <span>/</span>
          <a href="/blog" className="hover:text-foreground transition-colors">블로그</a>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
        </div>

        <PostHeader meta={post} />

        <div className="prose-clean">{mdxContent}</div>

        <PostFooterCta />

        {/* tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-card-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium px-3 py-1 rounded-lg bg-muted-light text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* related posts */}
        {related.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-foreground mb-4">관련 글</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.map((p) => (
                <BlogCard key={p.slug} meta={p} />
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
