export function formatWordCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}만자`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}천자`;
  }
  return `${count}자`;
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
