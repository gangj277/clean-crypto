import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clean Crypto — 당신의 리딩방, 검증하셨나요?",
  description:
    "리딩방 신뢰도를 무료로 검증하세요. 수익 인증 조작, 선행매매, 다단계 구조 등 위험 신호를 분석합니다.",
  openGraph: {
    title: "Clean Crypto — 당신의 리딩방, 검증하셨나요?",
    description:
      "2년간 피해액 1조 2,901억 원. 당신의 리딩방은 안전한가요? 30초 무료 검증.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
