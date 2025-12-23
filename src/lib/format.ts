/**
 * 글자수를 실제 숫자로 포맷팅 (콤마 구분)
 * 예: 2134 → "2,134자"
 */
export function formatCharacterCount(count: number): string {
  return `${count.toLocaleString("ko-KR")}자`;
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
