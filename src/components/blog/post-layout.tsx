import type { PostMeta } from "@/lib/blog";

const CATEGORY_LABEL: Record<string, string> = {
  guide: "가이드",
  analysis: "분석",
  news: "뉴스",
};

export function PostHeader({ meta }: { meta: PostMeta }) {
  return (
    <header className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-primary-light text-primary-dark">
          {CATEGORY_LABEL[meta.category] ?? meta.category}
        </span>
        <span className="text-xs text-muted">
          {meta.date} · {meta.readingTime}분
        </span>
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight tracking-tight mb-4">
        {meta.title}
      </h1>
      <p className="text-muted text-base leading-relaxed">
        {meta.description}
      </p>
      <div className="mt-5 pt-5 border-t border-card-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d95a8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{meta.author}</p>
          <p className="text-xs text-muted">Clean Crypto</p>
        </div>
      </div>
    </header>
  );
}

export function PostFooterCta() {
  return (
    <div className="mt-12 mb-8 card-elevated p-6 md:p-8 !rounded-2xl text-center">
      <h3 className="text-lg font-bold text-foreground mb-2">
        이 글에서 다룬 위험 신호, 직접 확인해보세요
      </h3>
      <p className="text-sm text-muted mb-5">
        30초 무료 진단으로 내 리딩 환경의 위험도를 분석합니다
      </p>
      <a
        href="/verify"
        className="group inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-2xl text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/25"
      >
        무료 진단 시작하기
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

export function BlogCard({ meta }: { meta: PostMeta }) {
  return (
    <a href={`/blog/${meta.slug}`} className="block card-elevated p-5 !rounded-2xl hover:!shadow-xl group">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-light text-primary-dark">
          {CATEGORY_LABEL[meta.category] ?? meta.category}
        </span>
        <span className="text-[11px] text-muted">{meta.date}</span>
      </div>
      <h3 className="text-base font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors leading-snug">
        {meta.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed line-clamp-2">
        {meta.description}
      </p>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted">
        <span>{meta.readingTime}분 읽기</span>
        <span>·</span>
        <span>{meta.author}</span>
      </div>
    </a>
  );
}
