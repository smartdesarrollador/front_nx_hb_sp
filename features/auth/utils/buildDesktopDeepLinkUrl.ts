import { useAuthStore } from '@/store/authStore'

export function buildDesktopDeepLinkUrl(state: string): string {
  const store = useAuthStore.getState()
  const payload = btoa(
    JSON.stringify({
      access_token: store.accessToken,
      refresh_token: localStorage.getItem('hub-refreshToken'),
      user: store.user,
      tenant: store.tenant,
    }),
  )
  return `rbacdesktop://auth?payload=${encodeURIComponent(payload)}&state=${state}`
}
