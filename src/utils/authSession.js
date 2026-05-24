import { getLocalStorage, setLocalStorage, removeLocalStorage } from './localStorage'

export const API_BASE_URL = 'http://localhost:3000/api/v1/'
export const AUTH_REDIRECT_KEY = 'authRedirect'
export const SESSION_EXPIRED_EVENT = 'auth:session-expired'

export function getAuthTokens() {
  const user = getLocalStorage('user')
  return {
    accessToken: user?.accessToken ?? null,
    refreshToken: user?.refreshToken ?? null,
  }
}

export function setAuthTokens({ accessToken, refreshToken }) {
  const current = getLocalStorage('user') ?? {}
  setLocalStorage('user', {
    ...current,
    accessToken,
    refreshToken: refreshToken ?? current.refreshToken ?? null,
  })
}

export function clearAuthSession() {
  removeLocalStorage('user')
  removeLocalStorage('userDetails')
}

export function getAuthRedirectPath() {
  return sessionStorage.getItem(AUTH_REDIRECT_KEY)
}

export function clearAuthRedirect() {
  sessionStorage.removeItem(AUTH_REDIRECT_KEY)
}

export function dispatchSessionExpired(returnPath) {
  const path =
    returnPath || `${window.location.pathname}${window.location.search}`

  sessionStorage.setItem(AUTH_REDIRECT_KEY, path)
  clearAuthSession()

  window.dispatchEvent(
    new CustomEvent(SESSION_EXPIRED_EVENT, {
      detail: { returnPath: path },
    }),
  )
}

let refreshPromise = null

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

async function performTokenRefresh() {
  const { refreshToken } = getAuthTokens()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_BASE_URL}refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json().catch(() => ({}))

    if (response.ok && data?.accessToken) {
      setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
      return true
    }

    return false
  } catch {
    return false
  }
}

export function isAuthEndpoint(url = '') {
  const path = url.replace(/^\//, '')
  return path.startsWith('signin') || path.startsWith('refresh-token')
}
