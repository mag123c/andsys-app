# lib

## 역할
유틸리티 함수 모음. 순수 함수 위주로 구성.

## 파일 구조
| 파일 | 역할 |
|------|------|
| utils.ts | cn() 등 일반 유틸 (tailwind-merge) |
| constants.ts | 상수 정의 |
| guest.ts | 게스트 ID 관리, 게스트→회원 데이터 마이그레이션 |
| image-utils.ts | 이미지 리사이즈 (100x150), Base64 변환 |
| content-utils.ts | Tiptap 콘텐츠 텍스트 추출, 글자수 계산 |
| diff-utils.ts | 버전 비교 (시놉시스, 캐릭터) |
| graph-utils.ts | React Flow 관계도 레이아웃 계산 |
| format.ts | 날짜, 숫자 포맷팅 |
| export.ts | 챕터 내보내기 (TXT, 클립보드) |
| error.ts | 에러 처리 유틸 |
| spellcheck.ts | 맞춤법 검사 API 호출 |
| admin.ts | 관리자 권한 확인 |

## 하위 디렉토리
| 디렉토리 | 역할 |
|----------|------|
| mockup/ | 테스트용 목업 데이터 생성 |
| share/ | 공유 링크 관련 유틸 |

## 의존성
- 외부 라이브러리 최소화
- 순수 함수 지향

---
최종 수정: 2026-01-01
