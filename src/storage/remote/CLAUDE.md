# storage/remote

## 역할
Supabase 기반 원격 저장소 구현. 서버 동기화 담당.

## 파일 구조
| 파일 | 역할 |
|------|------|
| client.ts | Supabase 브라우저 클라이언트 생성 |
| server.ts | Supabase 서버 클라이언트 생성 |
| project.remote.ts | ProjectRepository 원격 구현 |
| chapter.remote.ts | ChapterRepository 원격 구현 |
| synopsis.remote.ts | SynopsisRepository 원격 구현 |
| character.remote.ts | CharacterRepository 원격 구현 |
| relationship.remote.ts | RelationshipRepository 원격 구현 |
| storage.ts | Supabase Storage 유틸 (이미지 업로드) |
| admin.ts | 관리자 전용 Supabase 클라이언트 |

## 핵심 개념
- **snake_case 변환**: DB 컬럼명(snake_case) ↔ TypeScript(camelCase)
- **이미지 Storage**: Base64 → Supabase Storage 업로드 → Signed URL

## 의존성
- `@supabase/supabase-js`
- `@supabase/ssr`
- `repositories/types/`

---
최종 수정: 2026-01-01
