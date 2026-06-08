export function setRefreshTokenCookie(token: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `hub-refreshToken=${token}; path=/; max-age=604800; SameSite=Strict`
}

export function clearRefreshTokenCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = 'hub-refreshToken=; path=/; max-age=0'
}
