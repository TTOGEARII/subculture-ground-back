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
 * 파일 URL 생성 — 호스트가 박힌 절대 URL을 저장하면 환경(로컬/프로덕션)에 따라
 * 깨지므로 호스트 없는 상대경로(`/uploads/<file>`)만 반환한다.
 * 표시할 때 프론트가 `apiBase`(NUXT_PUBLIC_API_BASE_URL)를 앞에 붙여 절대화한다.
 * @param filename 파일명
 * @returns `/uploads/<filename>` 상대경로
 */
export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}
