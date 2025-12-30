/**
 * 비밀번호 해시 유틸리티 (Web Crypto API 기반)
 * - salt 추가로 rainbow table 공격 방지
 * - PBKDF2 사용으로 brute force 공격 저항
 */

const SALT_LENGTH = 16;
const ITERATIONS = 100000;
const KEY_LENGTH = 32;

/**
 * 랜덤 salt 생성
 */
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Uint8Array를 hex 문자열로 변환
 */
function toHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * hex 문자열을 Uint8Array로 변환
 */
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * PBKDF2로 비밀번호 해시 생성
 */
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  return new Uint8Array(derivedBits);
}

/**
 * 비밀번호를 해시하여 저장용 문자열 생성
 * 형식: salt$hash (hex 인코딩)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const hash = await deriveKey(password, salt);
  return `${toHex(salt)}$${toHex(hash)}`;
}

/**
 * 비밀번호 검증
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split("$");
  if (!saltHex || !hashHex) return false;

  const salt = fromHex(saltHex);
  const expectedHash = fromHex(hashHex);
  const actualHash = await deriveKey(password, salt);

  // 타이밍 공격 방지를 위한 상수 시간 비교
  if (expectedHash.length !== actualHash.length) return false;

  let result = 0;
  for (let i = 0; i < expectedHash.length; i++) {
    result |= expectedHash[i] ^ actualHash[i];
  }
  return result === 0;
}
