# 표지 이미지 (Cover Image)

소설 표지 이미지 업로드 및 저장 전략.

## 사양

| 항목 | 값 |
|------|-----|
| **크기** | 100 x 150 px (고정) |
| **비율** | 2:3 |
| **포맷** | JPEG, PNG, WebP |
| **최대 용량** | 500KB |
| **저장소** | Supabase Storage (추상화) |
| **오프라인** | IndexedDB (Base64) |
| **디폴트** | 밝은 회색 배경 + 앱 로고 |

---

## 데이터 스키마

### Project 확장

```typescript
interface Project {
  // 기존 필드...

  // 표지 이미지 추가
  coverImageUrl: string | null;     // Supabase Storage URL
  coverImageBase64: string | null;  // 오프라인용 Base64 (IndexedDB만)
}
```

### 마이그레이션

```sql
-- Supabase 마이그레이션
ALTER TABLE projects
ADD COLUMN cover_image_url TEXT;
```

```typescript
// Dexie 마이그레이션
db.version(N).stores({
  projects: "id, userId, guestId, title, coverImageUrl, coverImageBase64, ..."
});
```

---

## 저장 전략

### 업로드 흐름

```
1. 사용자가 이미지 선택
   ↓
2. 클라이언트에서 리사이즈 (100x150)
   ↓
3. IndexedDB에 Base64 저장 (즉시 표시용)
   ↓
4. 온라인 상태 확인
   ├─ 온라인 → Supabase Storage 업로드 → URL 저장
   └─ 오프라인 → syncStatus: "pending"으로 마킹
```

### Supabase Storage 구조

```
storage/
└── covers/
    └── {userId}/
        └── {projectId}.{ext}
```

### 파일명 전략

```typescript
// 프로젝트별 단일 표지이므로 projectId로 파일명 고정
// 덮어쓰기 방식으로 버전 관리 불필요
const fileName = `covers/${userId}/${projectId}.webp`;
```

---

## 이미지 처리

### 리사이즈 로직

```typescript
async function resizeCoverImage(file: File): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 150;

  const ctx = canvas.getContext("2d");
  const img = await loadImage(file);

  // 중앙 크롭 + 리사이즈
  const scale = Math.max(100 / img.width, 150 / img.height);
  const x = (100 - img.width * scale) / 2;
  const y = (150 - img.height * scale) / 2;

  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.8);
  });
}
```

### Base64 변환

```typescript
async function fileToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

---

## UI 컴포넌트

### 표지 이미지 업로드

```
┌───────────────────────┐
│                       │
│   ┌─────────────┐     │
│   │             │     │
│   │  이미지     │     │
│   │  100x150    │     │
│   │             │     │
│   │  [📷 변경]  │     │
│   │             │     │
│   └─────────────┘     │
│                       │
│   [이미지 삭제]       │
│                       │
└───────────────────────┘
```

### 디폴트 이미지

```tsx
function DefaultCoverImage() {
  return (
    <div className="w-[100px] h-[150px] bg-muted flex items-center justify-center rounded">
      <AppLogo className="w-8 h-8 text-muted-foreground" />
    </div>
  );
}
```

### CoverImageUpload 컴포넌트

```tsx
interface CoverImageUploadProps {
  imageUrl: string | null;
  imageBase64: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  isLoading?: boolean;
}

function CoverImageUpload({
  imageUrl,
  imageBase64,
  onUpload,
  onRemove,
  isLoading,
}: CoverImageUploadProps) {
  const displayUrl = imageUrl || imageBase64;

  return (
    <div className="relative w-[100px] h-[150px]">
      {displayUrl ? (
        <img
          src={displayUrl}
          alt="표지 이미지"
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <DefaultCoverImage />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={isLoading}
      />

      {displayUrl && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="absolute -top-2 -right-2"
        >
          ✕
        </Button>
      )}
    </div>
  );
}
```

---

## 오프라인 동기화

### 업로드 대기열

```typescript
interface PendingUpload {
  projectId: string;
  base64: string;
  createdAt: Date;
}

// 온라인 복귀 시
async function syncPendingUploads() {
  const pending = await localDb.pendingUploads.toArray();

  for (const upload of pending) {
    const blob = base64ToBlob(upload.base64);
    await uploadToSupabase(upload.projectId, blob);
    await localDb.pendingUploads.delete(upload.projectId);
  }
}
```

### 동기화 상태 표시

```
표지 이미지
┌─────────────┐
│ [이미지]    │ ← 노란 테두리 = 업로드 대기 중
│ ⏳ 동기화중  │
└─────────────┘
```

---

## Repository 확장

```typescript
// projectRepository 확장
interface ProjectRepository {
  // 기존 메서드...

  // 표지 이미지
  uploadCoverImage(projectId: string, file: File): Promise<string>;
  removeCoverImage(projectId: string): Promise<void>;
}
```

---

## 컴포넌트 구조

```
src/components/features/project/
├── CoverImageUpload.tsx      # 업로드 컴포넌트
├── DefaultCoverImage.tsx     # 디폴트 이미지
└── CoverImageSyncStatus.tsx  # 동기화 상태 표시
```

---

## 접근성

- 이미지 `alt`: "소설 표지 이미지"
- 업로드 버튼: 키보드 접근 가능
- 삭제 확인: 다이얼로그로 실수 방지
