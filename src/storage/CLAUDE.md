# storage

## 역할
데이터 저장소 구현체. Repository 인터페이스를 로컬(IndexedDB)과 원격(Supabase)으로 구현.

## 하위 디렉토리
| 디렉토리 | 역할 |
|----------|------|
| local/ | IndexedDB(Dexie) 구현체 |
| remote/ | Supabase 구현체 |

## 의존성
- `repositories/` 인터페이스 구현
- `repositories/types/` 타입 사용

---
최종 수정: 2026-01-02
