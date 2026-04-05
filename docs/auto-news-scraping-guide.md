# 주간 뉴스 자동 수집 시스템 구현 가이드

## 목표

주 1회 자동으로 한국 암호화폐 리딩방 관련 뉴스/사건/규제 동향을 수집하고, LLM으로 분석·요약하여 `dashboard_news` 테이블에 적재한다.

---

## 아키텍처

```
Vercel Cron (매주 월요일 09:00 KST)
  → /api/cron/scrape-news (API Route)
    → 1. 뉴스 소스 스크래핑
    → 2. LLM으로 관련성 필터링 + 요약 + 카테고리 분류
    → 3. Neon DB에 신규 뉴스 INSERT
    → 4. 중복 체크 (제목 유사도)
```

## 구현 단계

### Step 1 — Vercel Cron 설정

`vercel.ts` 또는 `vercel.json`에 크론 잡 등록:

```ts
// vercel.ts
import { type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  crons: [
    {
      path: '/api/cron/scrape-news',
      schedule: '0 0 * * 1', // 매주 월요일 00:00 UTC (09:00 KST)
    },
  ],
};
```

또는 `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape-news",
      "schedule": "0 0 * * 1"
    }
  ]
}
```

### Step 2 — 뉴스 소스 선정 및 스크래핑

#### 수집 대상 소스 (우선순위 순)

| 소스 | URL | 방식 | 키워드 |
|------|-----|------|--------|
| **네이버 뉴스 검색** | `https://search.naver.com/search.naver?where=news&query=...` | HTML 파싱 | "리딩방 사기", "코인 리딩방", "투자리딩방" |
| **경찰청 보도자료** | `https://www.police.go.kr/user/bbs/BD_selectBbsList.do?q_bbsCode=1002` | HTML 파싱 | "투자리딩", "가상자산 사기" |
| **금감원 보도자료** | `https://www.fss.or.kr/fss/bbs/B0000188/list.do?menuNo=200218` | HTML 파싱 | "유사투자자문", "리딩방" |
| **금융위 보도자료** | `https://www.fsc.go.kr/no010101` | HTML 파싱 | "가상자산", "불공정거래" |
| **구글 뉴스 검색** | `https://news.google.com/rss/search?q=...&hl=ko&gl=KR` | RSS (XML) | "리딩방 사기", "코인 사기" |

#### 스크래핑 방식

**네이버 뉴스 (가장 포괄적):**

```typescript
// 네이버 검색 API 사용 (추천) — 클라이언트 ID/Secret 필요
// https://developers.naver.com/docs/serviceapi/search/news/news.md

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

async function searchNaverNews(query: string): Promise<NaverNewsItem[]> {
  const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=20&sort=date`;
  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID!,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET!,
    },
  });
  const data = await res.json();
  return data.items; // { title, link, description, pubDate }
}
```

> 네이버 뉴스 검색 API는 무료이며, 네이버 개발자센터에서 애플리케이션 등록 후 사용 가능.

**구글 뉴스 RSS (API 키 불필요):**

```typescript
async function fetchGoogleNewsRSS(query: string): Promise<RSSItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
  const res = await fetch(url);
  const xml = await res.text();
  // XML 파싱 (fast-xml-parser 또는 cheerio 사용)
  return parseRSSItems(xml);
}
```

**정부 보도자료 (HTML 파싱):**

```typescript
// cheerio로 HTML 파싱
import * as cheerio from "cheerio";

async function scrapePolicePress(): Promise<PressRelease[]> {
  const url = "https://www.police.go.kr/user/bbs/BD_selectBbsList.do?q_bbsCode=1002";
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const items: PressRelease[] = [];
  $(".board_list tbody tr").each((_, el) => {
    const title = $(el).find("td.title a").text().trim();
    const date = $(el).find("td.date").text().trim();
    const link = $(el).find("td.title a").attr("href");
    items.push({ title, date, link: `https://www.police.go.kr${link}` });
  });
  
  return items;
}
```

### Step 3 — LLM 분석 파이프라인

수집된 원시 뉴스를 LLM으로 필터링하고 구조화한다.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface AnalyzedNews {
  isRelevant: boolean;
  title: string;       // 정제된 한국어 제목
  summary: string;     // 2~3줄 요약
  category: "적발" | "규제" | "통계" | "판결" | "플랫폼" | "기타";
  source: string;      // 원 출처 기관명
  severity: "높음" | "보통" | "낮음";
}

async function analyzeNewsItem(rawTitle: string, rawContent: string): Promise<AnalyzedNews> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",  // 비용 효율적
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `다음 뉴스가 한국 암호화폐 리딩방(투자 시그널 그룹) 사기/규제/피해와 관련이 있는지 분석해주세요.

제목: ${rawTitle}
내용: ${rawContent}

다음 JSON 형식으로 응답해주세요:
{
  "isRelevant": true/false,
  "title": "정제된 제목 (30자 이내)",
  "summary": "2~3줄 요약",
  "category": "적발|규제|통계|판결|플랫폼|기타",
  "source": "원 출처 기관명",
  "severity": "높음|보통|낮음"
}`
      }
    ],
  });
  
  return JSON.parse(response.content[0].type === "text" ? response.content[0].text : "{}");
}
```

### Step 4 — 중복 체크 및 DB 적재

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function insertNewsIfNew(news: AnalyzedNews, date: string, url: string): Promise<boolean> {
  // URL 우선, 제목 보조 중복 체크
  const existing = await sql`
    SELECT id FROM dashboard_news 
    WHERE url = ${url}
    OR title = ${news.title} 
    OR title ILIKE ${'%' + news.title.slice(0, 20) + '%'}
    LIMIT 1
  `;
  
  if (existing.length > 0) return false;
  
  await sql`
    INSERT INTO dashboard_news (date, title, summary, category, source, url)
    VALUES (${date}, ${news.title}, ${news.summary}, ${news.category}, ${news.source}, ${url})
  `;
  
  return true;
}
```

### Step 5 — API Route 조합

```typescript
// /src/app/api/cron/scrape-news/route.ts

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Vercel Cron 인증 (프로덕션에서 필수)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. 여러 소스에서 뉴스 수집
    const queries = ["리딩방 사기", "코인 리딩방 검거", "투자리딩방 피해", "가상자산 불공정거래"];
    const rawItems = [];
    
    for (const query of queries) {
      const naverResults = await searchNaverNews(query);
      const googleResults = await fetchGoogleNewsRSS(query);
      rawItems.push(...naverResults, ...googleResults);
    }

    // 2. 최근 7일 내 뉴스만 필터링
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentItems = rawItems.filter(item => new Date(item.pubDate) > oneWeekAgo);

    // 3. 중복 제거 (URL 또는 제목 기준)
    const unique = deduplicateByTitle(recentItems);

    // 4. LLM 분석 (배치)
    let inserted = 0;
    for (const item of unique.slice(0, 20)) { // 최대 20건 분석 (비용 제한)
      const analysis = await analyzeNewsItem(item.title, item.description);
      if (!analysis.isRelevant) continue;
      
      const wasInserted = await insertNewsIfNew(
        analysis,
        formatDate(item.pubDate),
        item.link,
      );
      if (wasInserted) inserted++;
    }

    // 5. 오래된 뉴스 정리 (90일 이상)
    await sql`DELETE FROM dashboard_news WHERE date < ${ninetyDaysAgo()}`;

    return NextResponse.json({
      success: true,
      scanned: unique.length,
      inserted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("News scraping failed:", error);
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 });
  }
}
```

---

## 필요한 환경 변수

```env
# .env.local에 추가
DATABASE_URL="postgresql://..."              # 이미 설정됨
NAVER_CLIENT_ID="네이버_개발자_클라이언트_ID"
NAVER_CLIENT_SECRET="네이버_개발자_시크릿"
ANTHROPIC_API_KEY="sk-ant-..."               # LLM 분석용
CRON_SECRET="랜덤_시크릿_문자열"              # Vercel Cron 인증용
```

## 필요한 패키지

```bash
pnpm add cheerio fast-xml-parser @anthropic-ai/sdk
```

## 비용 추정

| 항목 | 주당 비용 |
|------|----------|
| 네이버 검색 API | 무료 (일 25,000건 한도) |
| Claude Haiku 분석 | ~$0.05 (20건 × ~500토큰) |
| Neon DB | 무료 티어 충분 |
| Vercel Cron | Pro 플랜 필요 ($20/월, 다른 기능도 포함) |
| **합계** | **~$0.05/주 (Vercel Pro 별도)** |

## 수동 실행

개발/테스트 시에는 API 라우트를 직접 호출:

```bash
# 로컬 개발 서버에서
curl http://localhost:3005/api/cron/scrape-news \
  -H "Authorization: Bearer ${CRON_SECRET}"

# Vercel에 배포된 상태에서
curl https://cleancrypto.kr/api/cron/scrape-news \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

## 구현 순서

1. 네이버 개발자센터에서 검색 API 애플리케이션 등록
2. 환경 변수 설정 (`NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `CRON_SECRET`)
3. `cheerio`, `fast-xml-parser`, `@anthropic-ai/sdk` 설치
4. `/src/app/api/cron/scrape-news/route.ts` 구현
5. 로컬에서 수동 실행하여 테스트
6. Vercel에 배포 후 Cron 설정 확인
7. 첫 주 모니터링 — 관련성 필터링 정확도 확인 후 프롬프트 튜닝

## 확장 가능성

- **실시간 알림**: 심각도 "높음" 뉴스가 감지되면 Telegram/Slack 알림
- **headline 자동 업데이트**: 연간 통계 발표 시 `dashboard_headline` 테이블도 자동 업데이트
- **뉴스레터 연동**: 주간 수집 결과를 뉴스레터 콘텐츠로 자동 가공
