import type { MDXComponents } from "mdx/types";

function CtaBanner() {
  return (
    <div className="my-8 rounded-2xl bg-gradient-to-r from-primary-light to-accent-light p-6 border border-primary/10">
      <p className="text-base font-bold text-foreground mb-1">
        내 리딩 환경에도 해당되는 패턴이 있나요?
      </p>
      <p className="text-sm text-muted mb-4">
        30초 무료 진단으로 위험 신호를 확인해보세요.
      </p>
      <a
        href="/verify"
        className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-dark transition-colors"
      >
        무료 진단 시작하기
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  );
}

function Callout({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warning" | "danger" }) {
  const styles = {
    info: "bg-primary-light/50 border-primary/20 text-primary-dark",
    warning: "bg-amber-light border-amber/20 text-amber-800",
    danger: "bg-red-light border-red/20 text-red-800",
  };
  const icons = {
    info: "💡",
    warning: "⚠️",
    danger: "🚨",
  };
  return (
    <div className={`my-5 rounded-xl border p-4 text-sm leading-relaxed ${styles[type]}`}>
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2 className="text-xl font-bold text-foreground mt-12 mb-4 scroll-mt-20" {...props} />
  ),
  h3: (props) => (
    <h3 className="text-lg font-bold text-foreground mt-8 mb-3 scroll-mt-20" {...props} />
  ),
  p: (props) => (
    <p className="text-[15px] text-foreground/85 leading-[1.8] mb-4" {...props} />
  ),
  ul: (props) => (
    <ul className="text-[15px] text-foreground/85 leading-[1.8] mb-4 pl-5 list-disc space-y-1" {...props} />
  ),
  ol: (props) => (
    <ol className="text-[15px] text-foreground/85 leading-[1.8] mb-4 pl-5 list-decimal space-y-1" {...props} />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  strong: (props) => <strong className="font-bold text-foreground" {...props} />,
  a: (props) => (
    <a className="text-primary hover:text-primary-dark underline underline-offset-2 transition-colors" {...props} />
  ),
  blockquote: (props) => (
    <blockquote className="my-5 border-l-3 border-primary/30 pl-4 text-muted italic" style={{ borderLeftWidth: 3 }} {...props} />
  ),
  table: (props) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-card-border">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-section-bg" {...props} />,
  th: (props) => (
    <th className="px-4 py-2.5 text-left font-semibold text-foreground text-xs" {...props} />
  ),
  td: (props) => (
    <td className="px-4 py-2.5 text-foreground/80 border-t border-card-border text-xs" {...props} />
  ),
  hr: () => <hr className="my-10 border-card-border" />,
  CtaBanner,
  Callout,
};
