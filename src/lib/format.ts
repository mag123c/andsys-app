/**
 * 글자수를 실제 숫자로 포맷팅 (콤마 구분)
 * 예: 2134 → "2,134자"
 */
export function formatCharacterCount(count: number): string {
  return `${count.toLocaleString("ko-KR")}자`;
}

/**
 * @deprecated formatCharacterCount 사용 권장
 */
export function formatWordCount(count: number): string {
  return formatCharacterCount(count);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
