# repositories

## 역할
데이터 접근 인터페이스 정의 (Port). 구현체(storage/local, storage/remote)와 분리하여 의존성 역전(DIP) 적용.

## 아키텍처

```
UseCase → Repository 인터페이스 (여기) → Local/Remote 구현체
                    ↑
              types/ 도메인 타입
```

Clean Architecture에서 **Driven Port** 역할. UseCase가 이 인터페이스에 의존하고, 구현체가 이를 구현.

## 파일 구조

| 파일 | 역할 |
|------|------|
| project.repository.ts | 프로젝트 CRUD 인터페이스 |
| chapter.repository.ts | 챕터 CRUD 인터페이스 |
| synopsis.repository.ts | 시놉시스 CRUD 인터페이스 |
| character.repository.ts | 캐릭터 CRUD 인터페이스 |
| relationship.repository.ts | 관계도 CRUD 인터페이스 |
| version.repository.ts | 버전 히스토리 인터페이스 |
| types/ | 도메인 타입 정의 (Project, Chapter 등) |

## 의존성

- `types/` 하위의 타입들만 의존
- 구현체에 의존하지 않음 (DIP)

## 규칙

- Supabase, Dexie 등 구체적 구현 import 금지
- 순수 TypeScript 인터페이스만 정의
- UseCase에서 이 인터페이스를 통해 데이터 접근

---
최종 수정: 2026-01-02
