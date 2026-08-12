// The access token lives in memory only — never localStorage — so it can't
// be read by an XSS payload that outlives this page load. The refresh token
// lives in an HttpOnly cookie the frontend never touches directly.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
