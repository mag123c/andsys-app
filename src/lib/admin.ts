/**
 * 어드민 이메일 Set (환경변수에서 가져옴, 모듈 레벨 캐싱)
 * Set.has()로 O(1) 조회 (기존 includes() O(n) 대비 성능 향상)
 */
let adminEmailsSet: Set<string> | null = null;

function getAdminEmailsSet(): Set<string> {
  if (adminEmailsSet) return adminEmailsSet;

  const emails = process.env.ADMIN_EMAILS || "";
  adminEmailsSet = new Set(
    emails
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
  return adminEmailsSet;
}

/**
 * 주어진 이메일이 어드민인지 확인
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmailsSet().has(email.toLowerCase());
}
