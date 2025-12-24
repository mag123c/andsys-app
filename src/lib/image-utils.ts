/**
 * 이미지 처리 유틸리티
 * - 표지 이미지 리사이즈 (100x150)
 * - Base64 변환
 */

const COVER_WIDTH = 100;
const COVER_HEIGHT = 150;

/**
 * 이미지 파일을 로드하여 HTMLImageElement 반환
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 표지 이미지를 100x150으로 리사이즈
 * 중앙 크롭 후 리사이즈하여 비율 유지
 */
export async function resizeCoverImage(file: File): Promise<Blob> {
  const img = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  // 중앙 크롭 + 리사이즈
  // 이미지가 캔버스를 완전히 채우도록 스케일 계산
  const scale = Math.max(
    COVER_WIDTH / img.width,
    COVER_HEIGHT / img.height
  );
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  const x = (COVER_WIDTH - scaledWidth) / 2;
  const y = (COVER_HEIGHT - scaledHeight) / 2;

  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

  // 원본 URL 해제
  URL.revokeObjectURL(img.src);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/webp",
      0.8
    );
  });
}

/**
 * Blob을 Base64 데이터 URL로 변환
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 이미지 파일을 리사이즈하고 Base64로 변환
 */
export async function processCoverImage(file: File): Promise<string> {
  const resized = await resizeCoverImage(file);
  return blobToBase64(resized);
}
