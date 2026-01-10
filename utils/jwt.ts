import { IdentityType } from '../constants/identity-types';

/**
 * JWT payload interface
 */
export interface JWTPayload {
  identity_type?: IdentityType;
  name?: string;
  identity_number?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Base64 URL decode helper
 */
function base64UrlDecode(str: string): string {
  // Base64 URL -> Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

  // Padding ekle
  while (base64.length % 4) {
    base64 += '=';
  }

  try {
    // Prefer TextDecoder + atob for correct UTF-8 in browsers
    if (typeof TextDecoder !== 'undefined') {
      let binary = '';
      if (typeof atob !== 'undefined') {
        binary = atob(base64);
      }
      if (binary) {
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
      }
    }

    // Node / RN fallback via Buffer
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(base64, 'base64').toString('utf-8');
    }

    // Legacy browser fallback
    if (typeof atob !== 'undefined') {
      // decodeURIComponent(escape()) is deprecated but works as a last resort
      // for converting Latin-1 to UTF-8 in older environments
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return decodeURIComponent(escape(atob(base64)));
    }
  } catch (e) {
    console.error('Base64 decode error:', e);
  }

  return '';
}

/**
 * JWT token'ı decode eder ve payload'u döner
 * @param token JWT token string
 * @returns Decode edilmiş payload veya null
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    // JWT formatı: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);
    
    if (!decodedPayload) {
      return null;
    }

    return JSON.parse(decodedPayload) as JWTPayload;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * JWT token'dan identity_type'ı okur
 * @param token JWT token string
 * @returns IdentityType veya null
 */
export function getIdentityTypeFromToken(token: string): IdentityType | null {
  const payload = decodeJWT(token);
  return payload?.identity_type || null;
}

/**
 * Token'ın expire olup olmadığını kontrol eder
 * @param token JWT token string
 * @returns Token expire olduysa true, değilse false
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // exp saniye cinsinden, Date.now() millisecond cinsinden
  const now = Date.now() / 1000;
  return payload.exp < now;
}

/**
 * Token'dan `name` ve `identity_number` alanlarını döner
 * @param token JWT token string
 * @returns { name?: string; identity_number?: string } veya null
 */
export function getIdentityInfoFromToken(
  token: string
): { name?: string; identity_number?: string } | null {
  const payload = decodeJWT(token);
  if (!payload) return null;
  const { name, identity_number } = payload;
  return { name, identity_number };
}
