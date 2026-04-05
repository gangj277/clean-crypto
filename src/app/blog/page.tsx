import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/post-layout";

export const metadata: Metadata = {
  title: "블로그 | Clean Crypto",
  description:
    "암호화폐 리딩방의 위험 신호, 사기 수법, 올바른 선택 기준에 대한 전문 가이드를 제공합니다.",
  openGraph: {
    title: "블로그 | Clean Crypto",
    description:
      "리딩방 사기 패턴, 수수료 구조 분석, 수익률 조작 구별법 등 투자자를 위한 전문 콘텐츠.",
    locale: "ko_KR",
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 card-glass border-b border-white/40">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-5 h-14">
          <a href="/" className="font-bold text-lg tracking-tight text-foreground">
            Clean Crypto
          </a>
          <div className="flex items-center gap-5">
            <a href="/blog" className="text-sm font-semibold text-primary">블로그</a>
            <a href="/verify" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">검증하기</a>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-5 pt-12 pb-20">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">블로그</h1>
          <p className="text-muted text-base">
            리딩방의 위험 신호를 이해하고, 더 나은 투자 결정을 내리세요.
          </p>
        </div>

        {featured && (
          <div className="mb-8">
            <a href={`/blog/${featured.slug}`} className="block card-elevated p-6 md:p-8 !rounded-2xl hover:!shadow-xl group">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-primary-light text-primary-dark">
                추천 글
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors leading-snug">
                {featured.title}
              </h2>
              <p className="text-muted text-sm leading-relaxed mb-3">
                {featured.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>{featured.date}</span>
                <span>·</span>
                <span>{featured.readingTime}분 읽기</span>
              </div>
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rest.map((post) => (
            <BlogCard key={post.slug} meta={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
