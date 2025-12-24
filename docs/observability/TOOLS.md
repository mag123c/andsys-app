# 도구 비교 및 선택

## 도구별 역할 정의

```
GA4           = 어디서 왔나? (유입/마케팅)
PostHog       = 뭘 했나? (제품 사용)
Vercel        = 얼마나 빨랐나? (성능)
Sentry        = 뭐가 터졌나? (에러)
```

| 도구 | 관점 | 핵심 질문 |
|------|------|-----------|
| GA4 | 마케터 | "트위터 홍보가 효과 있나?" |
| PostHog | PM | "가입 후 이탈이 왜 많지?" |
| Vercel | 개발자 | "에디터가 왜 느리지?" |
| Sentry | 개발자 | "프로덕션에서 뭐가 터졌지?" |

---

## Sentry

### 선택 이유

```
✓ Next.js 공식 지원 (@sentry/nextjs)
✓ 에러 컨텍스트 자동 수집 (스택 트레이스, 브라우저, OS)
✓ Slack/Discord/Email 알림 무료
✓ 소스맵 지원으로 정확한 에러 위치
```

### 무료 한도

```
- 5,000 errors/월
- 10,000 transactions/월 (Performance)
- 1GB attachments
- 팀원 무제한
```

### 대안 비교

| 도구 | 장점 | 단점 |
|------|------|------|
| **Sentry** | Next.js 통합 최고 | - |
| Bugsnag | 안정적 | 무료 한도 적음 |
| Rollbar | 간단함 | Next.js 지원 약함 |
| LogRocket | 세션 리플레이 포함 | 무료 1K 세션 |

**결론**: Sentry가 Next.js 앱에 최적

---

## GA4 (Google Analytics 4)

### 선택 이유

```
✓ 완전 무료 (무제한)
✓ SEO 유입 분석 (Search Console 연동)
✓ UTM 파라미터로 SNS 홍보 효과 측정
✓ 업계 표준
```

### 측정 항목

```
- 유입 경로 (Organic, Social, Direct, Referral)
- 검색 키워드 (Search Console 연동 시)
- 페이지별 조회수, 이탈률
- 사용자 인구통계 (국가, 기기)
```

### 대안 비교

| 도구 | 장점 | 단점 |
|------|------|------|
| **GA4** | 무료 무제한, 표준 | 학습 곡선 |
| Plausible | 프라이버시, 간단 | $9/월~ |
| Fathom | 프라이버시 | $14/월~ |
| Umami | 셀프호스팅 무료 | 관리 필요 |

**결론**: 무료 + SEO 분석 = GA4

---

## PostHog

### 선택 이유

```
✓ 무료 1M events/월 (압도적)
✓ 제품 분석 올인원 (퍼널, 리텐션, 히트맵, 세션 리플레이)
✓ 오픈소스 (셀프호스팅 가능)
✓ 개발자 친화적 API
```

### 무료 한도

```
- 1,000,000 events/월
- 5,000 세션 리플레이/월
- 무제한 팀원
- 무제한 프로젝트
```

### 측정 항목

```
- 커스텀 이벤트 (프로젝트 생성, 챕터 저장 등)
- 퍼널 분석 (가입 → 첫 프로젝트 → 첫 챕터)
- 리텐션 (7일, 30일)
- 기능 사용률
```

### 대안 비교

| 도구 | 무료 한도 | 장점 | 단점 |
|------|-----------|------|------|
| **PostHog** | 1M/월 | 올인원, 오픈소스 | - |
| Mixpanel | 20K/월 | 성숙한 UI | 한도 적음 |
| Amplitude | 10M/월 | 강력한 분석 | 복잡함 |
| Heap | - | 자동 캡처 | 유료 |

**결론**: 무료 한도 + 기능 = PostHog

---

## Vercel Analytics

### 선택 이유

```
✓ Vercel 배포 시 원클릭 활성화
✓ Core Web Vitals 자동 측정
✓ 실제 사용자 데이터 (RUM)
✓ 50K events/월 무료
```

### 측정 항목

```
- LCP (Largest Contentful Paint): 로딩 속도
- FID (First Input Delay): 인터랙션 반응성
- CLS (Cumulative Layout Shift): 레이아웃 안정성
- TTFB (Time to First Byte): 서버 응답 속도
```

### 대안 비교

| 도구 | 장점 | 단점 |
|------|------|------|
| **Vercel** | 통합 간편 | Vercel 전용 |
| web-vitals | 무료, 유연 | 직접 구현 필요 |
| SpeedCurve | 상세 분석 | 유료 |
| Lighthouse CI | CI 통합 | 실사용자 데이터 아님 |

**결론**: Vercel 배포 = Vercel Analytics

---

## 최종 선택

| 영역 | 도구 | 이유 |
|------|------|------|
| 에러 | **Sentry** | Next.js 최적, 알림 무료 |
| 유입 | **GA4** | 무료 무제한, SEO 분석 |
| 제품 | **PostHog** | 무료 1M, 올인원 |
| 성능 | **Vercel Analytics** | 원클릭, 50K 무료 |

```
총 비용: $0/월
총 한도: 충분 (MVP~PMF 단계)
```
