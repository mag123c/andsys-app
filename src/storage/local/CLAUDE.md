# storage/local

## 역할
IndexedDB(Dexie) 기반 로컬 저장소 구현. 로컬 우선 저장의 핵심.

## 아키텍처

```
UseCase → Repository 인터페이스 → Local 구현체 (여기) → IndexedDB
```

## 파일 구조

| 파일 | 역할 |
|------|------|
| db.ts | Dexie 스키마 정의 (**v8**), 테이블 인터페이스 |
| project.local.ts | ProjectRepository 로컬 구현 |
| chapter.local.ts | ChapterRepository 로컬 구현 |
| synopsis.local.ts | SynopsisRepository 로컬 구현 |
| character.local.ts | CharacterRepository 로컬 구현 |
| relationship.local.ts | RelationshipRepository 로컬 구현 |
| version.local.ts | VersionRepository 로컬 구현 |
| settings.local.ts | 사용자 설정 저장 (guestId 등) |

## 핵심 개념

- **syncStatus**: `"synced"` | `"pending"` | `"conflict"`
- **로컬 우선**: 저장 시 즉시 IndexedDB에 기록, syncStatus를 "pending"으로 설정
- **이미지**: Base64로 저장 (`coverImageBase64`, `imageBase64`)

## 스키마 버전

현재: **v8** (2024-12-XX plot 필드 추가)

> 상세 마이그레이션 히스토리: `.claude/ai-context/technical/schema-history.json`

## 의존성

- `dexie` 라이브러리
- `repositories/types/` 타입

---
최종 수정: 2026-01-02
