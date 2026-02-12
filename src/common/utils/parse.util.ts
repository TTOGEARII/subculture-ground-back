/**
 * JSON 파싱 관련 유틸리티 함수들
 */

/**
 * JSON 문자열을 문자열 배열로 파싱
 * DB에 저장된 JSON 배열 문자열 (예: '["록","jpop"]')을 배열로 변환
 * 
 * @param value 파싱할 값 (문자열, 배열, 또는 null/undefined)
 * @returns 문자열 배열, 파싱 실패 시 빈 배열 반환
 * 
 * @example
 * parseJsonArray('["록","jpop"]') // ['록', 'jpop']
 * parseJsonArray('[]') // []
 * parseJsonArray(null) // []
 * parseJsonArray(['록', 'jpop']) // ['록', 'jpop']
 */
export function parseJsonArray(value: string | string[] | null | undefined): string[] {
  // null 또는 undefined인 경우 빈 배열 반환
  if (!value) {
    return [];
  }

  // 이미 배열인 경우 필터링하여 반환
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item !== '');
  }

  // 문자열인 경우 JSON 파싱 시도
  if (typeof value === 'string') {
    const trimmed = value.trim();

    // 빈 문자열이거나 특수 값인 경우 빈 배열 반환
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      // 파싱된 값이 배열인 경우
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter((item) => item !== '');
      }

      // 파싱된 값이 단일 문자열인 경우 배열로 변환
      if (typeof parsed === 'string') {
        const trimmedParsed = parsed.trim();
        return trimmedParsed ? [trimmedParsed] : [];
      }

      // 배열도 문자열도 아닌 경우 빈 배열 반환
      return [];
    } catch (error) {
      // JSON 파싱 실패 시 빈 배열 반환
      return [];
    }
  }

  // 예상치 못한 타입인 경우 빈 배열 반환
  return [];
}

/**
 * JSON 문자열을 객체로 파싱
 * 
 * @param value 파싱할 JSON 문자열
 * @returns 파싱된 객체, 실패 시 null 반환
 * 
 * @example
 * parseJsonObject('{"key": "value"}') // { key: 'value' }
 * parseJsonObject('invalid') // null
 */
export function parseJsonObject<T = any>(value: string | null | undefined): T | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return null;
  }

  try {
    return JSON.parse(trimmed) as T;
  } catch (error) {
    return null;
  }
}

/**
 * 값을 JSON 문자열로 직렬화
 * 
 * @param value 직렬화할 값
 * @returns JSON 문자열, 실패 시 빈 문자열 반환
 * 
 * @example
 * stringifyJson(['록', 'jpop']) // '["록","jpop"]'
 * stringifyJson({ key: 'value' }) // '{"key":"value"}'
 */
export function stringifyJson(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return '';
  }
}
