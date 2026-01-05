import { db } from "./db";

/**
 * 프로젝트가 게스트 소유인지 확인
 * @param projectId 프로젝트 ID
 * @returns 게스트 프로젝트면 true, 회원 프로젝트면 false
 */
export async function isGuestProject(projectId: string): Promise<boolean> {
  const project = await db.projects.get(projectId);
  return project?.guestId != null;
}
