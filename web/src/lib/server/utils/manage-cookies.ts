import { API_URL } from '$env/static/private'
import type { Cookies } from '@sveltejs/kit'

const IS_PROD = process.env.NODE_ENV === 'production'

export function setAuthCookies(cookies: Cookies, accessToken: string, refreshToken: string) {
    cookies.set('access_token', accessToken, {
      	path: '/',
      	httpOnly: true,
      	secure: IS_PROD,
      	sameSite: 'lax',
      	maxAge: 60 * 30,           // 30 min - matches JWT exp
    })

    cookies.set('refresh_token', refreshToken, {
      	path: '/',
      	httpOnly: true,
      	secure: IS_PROD,
      	sameSite: 'lax',
      	maxAge: 60 * 60 * 24 * 7, // 7 days
    })
}

export function clearAuthCookies(cookies: Cookies) {
  	cookies.delete('access_token', { path: '/' })
  	cookies.delete('refresh_token', { path: '/' })
}

// Call this in load functions - silently refreshes the access token if expired
export async function refreshAccessToken(
  	cookies: Cookies,
  	fetchFn: typeof fetch
): Promise<string | null> {
  	const refreshToken = cookies.get('refresh_token')
  	if (!refreshToken) return null

  	try {
  	  	const response = await fetchFn(`${API_URL}/api/auth/refresh`, {
  	  	  	method: 'POST',
  	  	  	headers: { 'Content-Type': 'application/json' },
  	  	  	body: JSON.stringify({ refreshToken }),
  	  	})
	  
  	  	if (!response.ok) {
  	  	  	clearAuthCookies(cookies)
  	  	  	return null
  	  	}
	  
  	  	const body = await response.json()
  	  	setAuthCookies(cookies, body.accessToken, body.refreshToken)
  	  	return body.accessToken
  	} catch {
  	  return null
  	}
}

// Returns a valid access token or null - refreshes automatically if needed
export async function getValidAccessToken(
  	cookies: Cookies,
  	fetchFn: typeof fetch
): Promise<string | null> {
  	return cookies.get('access_token') ?? refreshAccessToken(cookies, fetchFn)
}