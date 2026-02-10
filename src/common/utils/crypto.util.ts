/**
 * 암호화 키 가져오기
 */
function getEncryptionKey(): string {
  return process.env.ENCRYPTION_KEY || 'subculture-ground-encryption-key-2024';
}

/**
 * 간단한 해시 함수 (키 생성용)
 * 프론트엔드와 동일한 로직 사용 (호환성을 위해)
 */
function simpleHash(str: string): string {
  // 프론트엔드와 동일한 간단한 해시 함수 사용
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  // 항상 같은 길이의 문자열 반환 (32자)
  return Math.abs(hash).toString(16).padStart(32, '0');
}

/**
 * 16진수 문자열을 바이트 배열로 변환
 */
function hexStringToBytes(hex: string): Buffer {
  const bytes = Buffer.alloc(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * AES 암호화
 */
export function encrypt(data: string, key?: string): string {
  try {
    const encryptionKey = key || getEncryptionKey();
    const keyHash = simpleHash(encryptionKey);

    // UTF-8 문자열을 바이트 배열로 변환
    const dataBytes = Buffer.from(data, 'utf-8');
    // 키 해시를 바이트 배열로 변환 (16진수 문자열을 바이트 배열로)
    const keyBytes = hexStringToBytes(keyHash);

    // 바이트 단위로 XOR 암호화
    const encryptedBytes = Buffer.alloc(dataBytes.length);
    for (let i = 0; i < dataBytes.length; i++) {
      encryptedBytes[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    // Base64 인코딩
    return encryptedBytes.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw error; // 암호화 실패 시 에러 throw
  }
}

/**
 * AES 복호화
 */
export function decrypt(encryptedData: string, key?: string): string {
  try {
    const encryptionKey = key || getEncryptionKey();
    // Base64 디코딩하여 바이트 배열로 변환
    const encryptedBytes = Buffer.from(encryptedData, 'base64');

    const keyHash = simpleHash(encryptionKey);
    // 키 해시를 바이트 배열로 변환 (16진수 문자열을 바이트 배열로)
    const keyBytes = hexStringToBytes(keyHash);

    // 바이트 단위로 XOR 복호화
    const decryptedBytes = Buffer.alloc(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decryptedBytes[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    // 바이트 배열을 UTF-8 문자열로 변환
    return decryptedBytes.toString('utf-8');
  } catch (error) {
    console.error('Decryption error:', error);
    console.error('Encrypted data:', encryptedData.substring(0, 50));
    throw error; // 복호화 실패 시 에러 throw
  }
}

/**
 * 객체를 암호화된 문자열로 변환
 */
export function encryptObject<T>(obj: T, key?: string): string {
  const jsonString = JSON.stringify(obj);
  return encrypt(jsonString, key);
}

/**
 * 암호화된 문자열을 객체로 복호화
 */
export function decryptObject<T>(encryptedData: string, key?: string): T {
  try {
    const decryptedString = decrypt(encryptedData, key);
    // JSON 파싱 전에 유효성 검사
    if (!decryptedString || decryptedString.trim().length === 0) {
      throw new Error('복호화된 데이터가 비어있습니다.');
    }
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    console.error('decryptObject error:', error);
    console.error('Encrypted data:', encryptedData.substring(0, 100));
    throw new Error(
      `복호화 실패: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
