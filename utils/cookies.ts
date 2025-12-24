// Cookie helper functions for managing authentication tokens

/**
 * Set a cookie with expiration time
 * @param name Cookie name
 * @param value Cookie value
 * @param minutes Expiration time in minutes
 */
export const setCookie = (name: string, value: string, minutes: number): void => {
  if (typeof document === 'undefined') return;
  
  const date = new Date();
  date.setTime(date.getTime() + (minutes * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

/**
 * Get a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or null
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length);
    }
  }
  return null;
};

/**
 * Delete a cookie by name
 * @param name Cookie name
 */
export const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};
