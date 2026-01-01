import { createClient } from "./client";

/**
 * Supabase Storage 유틸리티
 * - 프로젝트 표지: project-covers/{userId}/{projectId}.webp
 * - 캐릭터 이미지: character-images/{userId}/{characterId}.webp
 */

type BucketType = "project-covers" | "character-images";

/**
 * Base64 데이터 URL을 Blob으로 변환
 */
function base64ToBlob(base64: string): Blob {
  // data:image/webp;base64,... 형식에서 데이터 추출
  const parts = base64.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/webp";
  const binaryString = atob(parts[1]);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/**
 * 이미지가 Base64인지 확인
 */
export function isBase64Image(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith("data:image/");
}

/**
 * Storage에 이미지 업로드
 * @returns Public URL
 */
export async function uploadImage(
  bucket: BucketType,
  userId: string,
  entityId: string,
  base64: string
): Promise<string> {
  const supabase = createClient();
  const blob = base64ToBlob(base64);
  const path = `${userId}/${entityId}.webp`;

  // 기존 파일 삭제 (덮어쓰기 전)
  await supabase.storage.from(bucket).remove([path]);

  // 업로드
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Public URL 생성 (버킷이 private이므로 signed URL 사용)
  const { data: signedData, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1년 유효

  if (signedError || !signedData?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${signedError?.message}`);
  }

  return signedData.signedUrl;
}

/**
 * Storage에서 이미지 삭제
 */
export async function deleteImage(
  bucket: BucketType,
  userId: string,
  entityId: string
): Promise<void> {
  const supabase = createClient();
  const path = `${userId}/${entityId}.webp`;

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    // 삭제 실패는 무시 (이미 없을 수 있음)
    console.warn(`Storage delete failed: ${error.message}`);
  }
}

/**
 * 프로젝트 표지 이미지 업로드
 */
export async function uploadProjectCover(
  userId: string,
  projectId: string,
  base64: string
): Promise<string> {
  return uploadImage("project-covers", userId, projectId, base64);
}

/**
 * 프로젝트 표지 이미지 삭제
 */
export async function deleteProjectCover(
  userId: string,
  projectId: string
): Promise<void> {
  return deleteImage("project-covers", userId, projectId);
}

/**
 * 캐릭터 이미지 업로드
 */
export async function uploadCharacterImage(
  userId: string,
  characterId: string,
  base64: string
): Promise<string> {
  return uploadImage("character-images", userId, characterId, base64);
}

/**
 * 캐릭터 이미지 삭제
 */
export async function deleteCharacterImage(
  userId: string,
  characterId: string
): Promise<void> {
  return deleteImage("character-images", userId, characterId);
}
