# application

## 역할

UseCase 레이어. Clean Architecture의 Application Layer 역할.
비즈니스 로직을 캡슐화하고, hooks와 repositories 사이에서 유효성 검증과 규칙 적용을 담당.

## 아키텍처

```
컴포넌트 → hooks → UseCase (여기) → Repository → Storage
```

### UseCase의 책임
- 비즈니스 규칙 적용 (CASCADE_DELETE, 유효성 검증 등)
- 트랜잭션 관리 (원자성 보장)
- 입출력 인터페이스 정의 (Input/Output 타입)
- 에러 처리 및 결과 반환

### UseCase가 하지 않는 것
- UI 상태 관리 (hooks의 역할)
- 데이터 영속화 세부사항 (Repository의 역할)
- React 의존성 (순수 TypeScript 함수)

## 파일 구조

```
application/
├── project/
│   ├── delete-project.usecase.ts   # CASCADE DELETE
│   └── index.ts
├── chapter/
│   ├── create-chapter.usecase.ts   # 챕터 생성 + 유효성 검증
│   ├── delete-chapter.usecase.ts   # 챕터 삭제 + 순서 재정렬
│   ├── reorder-chapters.usecase.ts # 순서 변경 + 유효성 검증
│   └── index.ts
└── index.ts                         # 모듈 export
```

## UseCase 목록

| UseCase | 규칙 | 설명 |
|---------|------|------|
| `deleteProjectUseCase` | CASCADE_DELETE | 프로젝트 + 모든 하위 데이터 삭제 |
| `createChapterUseCase` | - | 프로젝트 존재 검증 후 챕터 생성 |
| `deleteChapterUseCase` | CHAPTER_REORDER_ON_DELETE | 챕터 삭제 + 남은 챕터 순서 재정렬 |
| `reorderChaptersUseCase` | - | 챕터 ID 유효성 검증 후 순서 변경 |

## 사용 예시

```typescript
// hooks/useProjects.ts
import { deleteProjectUseCase } from "@/application/project";

const deleteProject = useCallback(async (id: string) => {
  const result = await deleteProjectUseCase({ projectId: id });
  if (!result.success) {
    throw new Error(`Failed to delete project: ${id}`);
  }
}, []);
```

## UseCase 작성 규칙

### 1. Input/Output 인터페이스 정의

```typescript
export interface XxxUseCaseInput {
  // 필요한 입력값
}

export interface XxxUseCaseOutput {
  success: boolean;
  // 결과 데이터
  error?: string;
}
```

### 2. 순수 함수로 구현

```typescript
export async function xxxUseCase(
  input: XxxUseCaseInput
): Promise<XxxUseCaseOutput> {
  // 1. 유효성 검증
  // 2. 비즈니스 로직 실행
  // 3. 결과 반환
}
```

### 3. JSDoc으로 비즈니스 규칙 문서화

```typescript
/**
 * UseCase 설명
 *
 * 비즈니스 규칙:
 * - 규칙 1
 * - 규칙 2
 *
 * @see ai-context/domain/rules.json#RULE_NAME
 */
```

## 추가 예정 UseCase

| UseCase | 우선순위 | 설명 |
|---------|---------|------|
| `migrateGuestDataUseCase` | 높음 | 게스트→회원 데이터 마이그레이션 |
| `archiveProjectUseCase` | 낮음 | 프로젝트 보관 처리 |

## 의존성

- `storage/local/db` - Dexie 인스턴스
- `storage/local/*` - 로컬 저장소 구현체
- `repositories/types/` - 타입 정의

---
최종 수정: 2026-01-05
