import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * 업로드 디렉토리 경로 반환
 */
export function getUploadDir(): string {
  return process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
}

/**
 * 업로드 디렉토리 생성 (없는 경우)
 */
export async function ensureUploadDir(): Promise<void> {
  const uploadDir = getUploadDir();
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
}

/**
 * 파일 저장
 * @param buffer 파일 버퍼
 * @param filename 파일명
 * @returns 저장된 파일의 경로
 */
export async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  await ensureUploadDir();
  const uploadDir = getUploadDir();
  const filePath = join(uploadDir, filename);
  await writeFile(filePath, buffer);
  return filePath;
}

/**
 * 고유한 파일명 생성
 * @param originalFilename 원본 파일명
 * @returns 고유한 파일명
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = originalFilename.split('.').pop();
  return `${timestamp}-${random}.${ext}`;
}

/**
 * 파일 URL 생성
 * @param filename 파일명
 * @returns 파일 URL
 */
export function getFileUrl(filename: string): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
  return `${baseUrl}/uploads/${filename}`;
}
