# AI Context

이 디렉토리는 Claude가 프로젝트를 이해하는 데 필요한 **지식 문서**를 담고 있습니다.

## 구조

```
ai-context/
├── domain/              # 도메인 지식
│   ├── glossary.json    # 웹소설 도메인 용어
│   ├── rules.json       # 비즈니스 규칙
│   └── entities.json    # 엔터티 관계도
│
├── technical/           # 기술 지식
│   ├── routes.json      # App Router 구조
│   ├── sync-flow.json   # 동기화 흐름
│   ├── editor-config.json # 에디터 설정
│   └── schema-history.json # DB 마이그레이션 히스토리
│
├── components/          # 컴포넌트 지식
│   └── dependency-map.json # 컴포넌트-훅 의존성
│
└── README.md            # 이 파일
```

## 로딩 규칙

### 기본 로딩 (모든 세션)

다음 파일들은 **항상** 참조:

| 파일 | 용도 |
|------|------|
| `domain/glossary.json` | 웹소설 용어 이해 |
| `domain/rules.json` | 비즈니스 규칙 준수 |
| `domain/entities.json` | 데이터 구조 이해 |

### 선택적 로딩

작업 유형에 따라 **추가** 참조:

| 작업 | 추가 로딩 |
|------|----------|
| Editor 관련 | `technical/editor-config.json` |
| Sync 관련 | `technical/sync-flow.json` |
| DB 스키마 변경 | `technical/schema-history.json` |
| 라우트 추가/변경 | `technical/routes.json` |
| 컴포넌트 구조 파악 | `components/dependency-map.json` |

## 사용 예시

### 1. 새 기능 개발 시

```
1. glossary.json - 관련 도메인 용어 확인
2. rules.json - 적용해야 할 비즈니스 규칙 확인
3. entities.json - 영향받는 엔터티 확인
4. (필요시) 추가 문서 참조
```

### 2. 에디터 수정 시

```
1. 기본 3개 파일
2. editor-config.json - 현재 에디터 설정 확인
3. dependency-map.json - 관련 컴포넌트/훅 확인
```

### 3. DB 스키마 변경 시

```
1. 기본 3개 파일
2. schema-history.json - 마이그레이션 히스토리 확인
3. entities.json - 필드 추가/수정 후 업데이트
```

## 토큰 예측

| 세션 유형 | 로딩 파일 | 예상 토큰 |
|----------|----------|----------|
| 일반 작업 | domain/* (3개) | ~2K |
| Editor 작업 | + editor-config | ~2.5K |
| Sync 작업 | + sync-flow | ~3K |
| 전체 분석 | 모든 파일 | ~5K |

## 문서 업데이트 규칙

1. **entities.json**: 테이블/필드 변경 시 반드시 업데이트
2. **rules.json**: 새 비즈니스 규칙 추가 시 업데이트
3. **schema-history.json**: Dexie 버전 변경 시 업데이트
4. **routes.json**: 라우트 추가/변경 시 업데이트
5. **dependency-map.json**: 새 컴포넌트/훅 추가 시 업데이트

## 참고

- [컬리 OMS팀의 Claude AI 협업 사례](https://helloworld.kurly.com/blog/oms-claude-ai-workflow/)
- `docs/AI-CONTEXT-OPTIMIZATION.md` - 이 구조의 설계 결정 문서

---
최종 수정: 2026-01-02
