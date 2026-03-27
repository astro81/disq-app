import type { PageServerLoad } from './$types'
import { redirect, error } from '@sveltejs/kit'
import { setAuthCookies } from '$lib/server/utils/manage-cookies'

/**
 * The Hono backend redirects here after a successful OAuth handshake:
 *   /auth/callback?accessToken=...&refreshToken=...
 *
 * We read the tokens out of the URL, set them as httpOnly cookies,
 * then redirect into the app. The tokens never touch client-side JS.
 */
export const load: PageServerLoad = async ({ url, cookies }) => {
    const accessToken  = url.searchParams.get('accessToken')
    const refreshToken = url.searchParams.get('refreshToken')
    const oauthError   = url.searchParams.get('error')

    // Backend signalled a failure - bounce to login with a message
    if (oauthError) {
        redirect(302, `/login?message=${encodeURIComponent('OAuth sign-in failed. Please try again.')}`)
    }

    if (!accessToken || !refreshToken) {
        error(400, 'Missing tokens in OAuth callback')
    }

    setAuthCookies(cookies, accessToken, refreshToken)

    redirect(302, '/servers/@me')
}