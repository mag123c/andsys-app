import type { FieldDiff, LineDiff, VersionDiff } from "@/repositories/types";

/**
 * 두 텍스트 간의 라인 단위 diff를 계산합니다.
 */
export function computeLineDiff(
  oldText: string | null,
  newText: string | null
): LineDiff[] {
  const oldLines = (oldText || "").split("\n");
  const newLines = (newText || "").split("\n");

  const result: LineDiff[] = [];

  // Simple LCS-based diff algorithm
  const lcs = computeLCS(oldLines, newLines);
  let oldIdx = 0;
  let newIdx = 0;
  let lcsIdx = 0;

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (lcsIdx < lcs.length && oldIdx < oldLines.length && oldLines[oldIdx] === lcs[lcsIdx]) {
      // Line is unchanged
      if (newIdx < newLines.length && newLines[newIdx] === lcs[lcsIdx]) {
        result.push({
          type: "unchanged",
          content: lcs[lcsIdx],
          lineNumber: newIdx + 1,
        });
        oldIdx++;
        newIdx++;
        lcsIdx++;
      } else {
        // New line added
        result.push({
          type: "added",
          content: newLines[newIdx],
          lineNumber: newIdx + 1,
        });
        newIdx++;
      }
    } else if (oldIdx < oldLines.length) {
      // Old line removed
      result.push({
        type: "removed",
        content: oldLines[oldIdx],
      });
      oldIdx++;
    } else if (newIdx < newLines.length) {
      // New line added
      result.push({
        type: "added",
        content: newLines[newIdx],
        lineNumber: newIdx + 1,
      });
      newIdx++;
    }
  }

  return result;
}

/**
 * Longest Common Subsequence 계산
 */
function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find LCS
  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

/**
 * 두 객체 간의 필드별 diff를 계산합니다.
 */
export function computeFieldDiff(
  oldObj: Record<string, unknown> | null,
  newObj: Record<string, unknown>
): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const old = oldObj || {};

  // 무시할 필드 (메타데이터)
  const ignoreFields = new Set([
    "id",
    "projectId",
    "createdAt",
    "updatedAt",
    "syncStatus",
    "lastSyncedAt",
    "order",
  ]);

  // 모든 키 수집
  const allKeys = new Set([...Object.keys(old), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    if (ignoreFields.has(key)) continue;

    const oldValue = old[key];
    const newValue = newObj[key];

    if (!isEqual(oldValue, newValue)) {
      diffs.push({
        field: key,
        oldValue,
        newValue,
      });
    }
  }

  return diffs;
}

/**
 * 두 값이 동일한지 비교합니다.
 */
function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => isEqual(item, b[i]));
  }

  if (typeof a === "object" && typeof b === "object") {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => isEqual(aObj[key], bObj[key]));
  }

  return false;
}

/**
 * 전체 버전 diff를 계산합니다.
 */
export function computeVersionDiff(
  oldSnapshot: Record<string, unknown> | null,
  newSnapshot: Record<string, unknown>,
  entityType: "synopsis" | "character"
): VersionDiff {
  const diff: VersionDiff = {};

  // 필드 diff 계산
  diff.fields = computeFieldDiff(oldSnapshot, newSnapshot);

  // 시놉시스의 경우 plainText에 대해 라인 diff도 계산
  if (entityType === "synopsis") {
    const oldText = (oldSnapshot?.plainText as string) || null;
    const newText = (newSnapshot.plainText as string) || null;

    if (oldText !== newText) {
      diff.lines = computeLineDiff(oldText, newText);
    }
  }

  return diff;
}

/**
 * Diff가 비어있는지 확인합니다.
 */
export function isDiffEmpty(diff: VersionDiff | null): boolean {
  if (!diff) return true;

  const hasFieldChanges = diff.fields && diff.fields.length > 0;
  const hasLineChanges = diff.lines && diff.lines.some((l) => l.type !== "unchanged");

  return !hasFieldChanges && !hasLineChanges;
}

/**
 * 필드명을 한글로 변환합니다.
 */
export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    name: "이름",
    nickname: "별명",
    age: "나이",
    gender: "성별",
    race: "종족",
    imageUrl: "이미지",
    imageBase64: "이미지",
    height: "키",
    weight: "몸무게",
    appearance: "외형",
    mbti: "MBTI",
    personality: "성격",
    education: "학력",
    occupation: "직업",
    affiliation: "소속",
    background: "배경",
    customFields: "커스텀 필드",
    content: "내용",
    plainText: "텍스트",
    wordCount: "글자수",
  };

  return labels[field] || field;
}
