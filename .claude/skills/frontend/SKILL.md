---
name: frontend
description: 프론트엔드 개발 스킬. RSC 보안, 서버/클라이언트 분리, SEO. 프론트엔드 작업 시 사용.
---

# Frontend Skill

## RSC 보안 (필수)

### 금지 패턴

1. **Server Action에서 전체 객체 반환 금지**
   - BAD: `return user`
   - GOOD: `return { id: user.id, displayName: user.displayName }`

2. **Closure에서 민감 데이터 캡처 금지**
   - 환경변수, DB 결과 등이 직렬화되어 클라이언트로 전송될 수 있음

3. **인라인 Server Action 지양**
   - `src/actions/` 폴더에 별도 파일로 분리

### Server Action 규칙

```
src/actions/
├── project.ts    # "use server" 상단 선언
├── chapter.ts
└── auth.ts
```

- 입력 검증 필수
- try-catch로 에러 처리
- 구체적 에러는 로깅만, 클라이언트에는 일반 메시지

## 서버/클라이언트 분리

| 서버 컴포넌트 | 클라이언트 컴포넌트 |
|---------------|---------------------|
| 데이터 페칭 | useState, useEffect |
| 환경변수/DB 접근 | 이벤트 핸들러 |
| SEO 콘텐츠 | 브라우저 API |
| 무거운 의존성 | 인터랙티브 UI |

## SEO

### 메타데이터
- 정적: layout.tsx에 `export const metadata`
- 동적: page.tsx에 `export async function generateMetadata`

### 시맨틱 마크업
- `<main>`, `<article>`, `<nav>`, `<aside>` 활용
- heading 계층 준수 (h1 → h2 → h3)

## 에러 핸들링

| 파일 | 용도 |
|------|------|
| error.tsx | 라우트 에러 바운더리 |
| not-found.tsx | 404 페이지 |
| loading.tsx | Suspense fallback |

## 체크리스트

- [ ] 서버/클라이언트 구분 결정
- [ ] Server Action 별도 파일 분리
- [ ] 입력 검증, 에러 처리
- [ ] 메타데이터 설정 (SEO 필요 시)
- [ ] 접근성 확인

> Next.js 공식 문서: https://nextjs.org/docs
