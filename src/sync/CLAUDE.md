# sync

## 역할
로컬-서버 동기화 엔진. pending 상태 데이터를 Supabase로 동기화하고, Realtime으로 변경 감지.

## 파일 구조
| 파일 | 역할 |
|------|------|
| index.ts | 모듈 export |
| sync-engine.ts | SyncEngine 클래스 (동기화 핵심 로직) |
| sync-queue.ts | 동기화 큐 관리 (재시도, 실패 처리) |

## 핵심 개념
- **syncAll()**: 모든 pending 항목 서버 동기화
- **pullFromServer()**: 서버 → 로컬 데이터 가져오기
- **handleRealtimeEvent()**: Supabase Realtime 이벤트 처리
- **충돌 해결**: Latest-wins (updatedAt 비교)
- **이미지 동기화**: Base64 → Storage 업로드 → URL 저장

## 동기화 흐름
```
로컬 저장 (pending) → syncAll() → Supabase 업로드 → synced
                                 ↓
                   Realtime 구독 → 다른 기기 변경 감지 → 로컬 업데이트
```

## 의존성
- `storage/local/db`
- `storage/remote/*`
- `@supabase/supabase-js`

---
최종 수정: 2026-01-01
