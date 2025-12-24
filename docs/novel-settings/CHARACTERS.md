# 등장인물 관리 (Characters)

등장인물 생성, 편집, 조회를 위한 상세 기획.

## 캐릭터 스키마

### 기본 필드

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `id` | UUID | ✅ | Primary Key |
| `projectId` | UUID | ✅ | 소속 소설 |
| `name` | string | ✅ | 이름 |
| `nickname` | string | | 별명/호칭 |
| `age` | number | | 나이 |
| `gender` | string | | 성별 |
| `race` | string | | 종족 |
| `imageUrl` | string | ✅ | 프로필 이미지 (필수) |
| `order` | number | ✅ | 정렬 순서 |

### 외형

| 필드 | 타입 | 설명 |
|------|------|------|
| `height` | number | 키 (cm) |
| `weight` | number | 몸무게 (kg) |
| `appearance` | text | 외형 설명 |

### 성격/배경

| 필드 | 타입 | 설명 |
|------|------|------|
| `mbti` | string | MBTI (16가지) |
| `personality` | text | 성격 설명 |
| `education` | string | 학력 |
| `occupation` | string | 직업 |
| `affiliation` | string | 소속 |
| `background` | text | 배경 스토리 |

### 커스텀 필드

```typescript
interface CustomField {
  key: string;
  value: string;
}

// 예시
customFields: [
  { key: "특기", value: "검술" },
  { key: "약점", value: "고소공포증" }
]
```

### 메타데이터

| 필드 | 타입 | 설명 |
|------|------|------|
| `createdAt` | timestamp | 생성 시각 |
| `updatedAt` | timestamp | 수정 시각 |
| `syncStatus` | string | 동기화 상태 |

---

## TypeScript 인터페이스

```typescript
interface Character {
  id: string;
  projectId: string;

  // 기본 정보
  name: string;
  nickname: string | null;
  age: number | null;
  gender: string | null;
  race: string | null;
  imageUrl: string;
  order: number;

  // 외형
  height: number | null;
  weight: number | null;
  appearance: string | null;

  // 성격/배경
  mbti: string | null;
  personality: string | null;
  education: string | null;
  occupation: string | null;
  affiliation: string | null;
  background: string | null;

  // 확장
  customFields: CustomField[];

  // 메타
  createdAt: Date;
  updatedAt: Date;
  syncStatus: "synced" | "pending" | "conflict";
}
```

---

## UI 설계

### 캐릭터 목록 페이지

```
┌──────────────────────────────────────────────────────────────┐
│ ← 소설 목록     등장인물                        [+ 추가]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │  이미지  │  │  이미지  │  │  이미지  │  │  이미지  │         │
│  │ 100x150 │  │ 100x150 │  │ 100x150 │  │ 100x150 │         │
│  ├─────────┤  ├─────────┤  ├─────────┤  ├─────────┤         │
│  │ 홍길동   │  │ 김철수   │  │ 이영희   │  │ + 추가  │         │
│  │ 주인공   │  │ 조력자   │  │ 히로인   │  │         │         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │
│                                                              │
│  드래그로 순서 변경                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 캐릭터 상세/편집

```
┌──────────────────────────────────────────────────────────────┐
│ ← 등장인물     홍길동                    [저장] [삭제]        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐   기본 정보                               │
│  │              │   ┌────────────────────────────────┐      │
│  │   프로필     │   │ 이름    [홍길동            ]   │      │
│  │   이미지     │   │ 별명    [의적               ]   │      │
│  │   (클릭업로드)│   │ 나이    [25                 ]   │      │
│  │   100x150   │   │ 성별    [남성 ▼             ]   │      │
│  │              │   │ 종족    [인간               ]   │      │
│  └──────────────┘   └────────────────────────────────┘      │
│                                                              │
│  외형                                                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 키      [180    ] cm    몸무게  [75    ] kg        │     │
│  │ 외형 설명                                           │     │
│  │ [검은 머리, 날카로운 눈매...                    ]   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  성격 & 배경                                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │ MBTI    [INTJ ▼]                                   │     │
│  │ 성격    [과묵하지만 정의감이 강함...           ]   │     │
│  │ 학력    [서당 수료                            ]    │     │
│  │ 직업    [의적                                  ]   │     │
│  │ 소속    [활빈당                               ]    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  커스텀 필드                            [+ 필드 추가]        │
│  ┌────────────────────────────────────────────────────┐     │
│  │ [특기    ] : [검술, 경공                      ] ✕  │     │
│  │ [약점    ] : [고소공포증                      ] ✕  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 구현 상세

### Repository 패턴

```typescript
// repositories/types/character.ts
interface CharacterRepository {
  findByProjectId(projectId: string): Promise<Character[]>;
  findById(id: string): Promise<Character | null>;
  create(data: CreateCharacterInput): Promise<Character>;
  update(id: string, data: UpdateCharacterInput): Promise<Character>;
  delete(id: string): Promise<void>;
  reorder(projectId: string, characterIds: string[]): Promise<void>;
}
```

### 이미지 처리

```typescript
// 이미지 업로드 흐름
1. 사용자가 이미지 선택
2. 클라이언트에서 100x150으로 리사이즈
3. Base64로 인코딩 → IndexedDB 저장 (오프라인 지원)
4. 온라인 시 Supabase Storage 업로드
5. imageUrl 필드 업데이트
```

### 정렬 및 드래그

- `@dnd-kit` 사용 (기존 회차 정렬과 동일)
- `order` 필드 기반 정렬
- 드래그 종료 시 `reorder()` 호출

---

## 컴포넌트 구조

```
src/components/features/character/
├── index.ts                    # barrel export
├── CharacterCard.tsx           # 목록 카드
├── CharacterForm.tsx           # 상세/편집 폼
├── CharacterImageUpload.tsx    # 이미지 업로드
├── CreateCharacterDialog.tsx   # 생성 다이얼로그
├── SortableCharacterList.tsx   # 드래그 정렬
└── CharacterCustomFields.tsx   # 커스텀 필드 편집
```

---

## 접근성

- 이미지: `alt` 속성에 캐릭터 이름
- 폼: 모든 입력 필드에 `label` 연결
- 드래그: 키보드 대체 (화살표 + Enter)
- 삭제: 확인 다이얼로그 필수
