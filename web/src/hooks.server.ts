import { sequence } from "@sveltejs/kit/hooks"
import { redirect, type Handle } from "@sveltejs/kit"
import { building } from "$app/environment"
import { API_URL } from "$env/static/private"
import { handleLoginRedirect } from "$lib/server/utils/login-redirect"
import { setAuthCookies } from "$lib/server/utils/manage-cookies"

// Route groups
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"]
const PROTECTED_ROUTES = ["/servers"]

// Routes that should never be tracked as "last path" or blocked by auth guards
// /auth/callback must be excluded so the OAuth token handoff always runs
const BYPASS_ROUTES = ["/auth/callback"]


function isAuthRoute(pathname: string) { 
    return AUTH_ROUTES.some(r => pathname.startsWith(r)) 
}

function isProtectedRoute(pathname: string) { 
    return PROTECTED_ROUTES.some(r => pathname.startsWith(r)) 
}

function isBypassRoute(pathname: string) {
    return BYPASS_ROUTES.some(r => pathname.startsWith(r))
}

// Resolve access token - refresh silently if expired 
const tokenHook: Handle = async ({ event, resolve }) => {
    event.locals.userId = null
    event.locals.accessToken = null

    const accessToken = event.cookies.get("access_token")
    const refreshToken = event.cookies.get("refresh_token")

    if (accessToken) {
        event.locals.accessToken = accessToken

        // Decode sub from JWT payload
        try {
            const payload = JSON.parse(atob(accessToken.split(".")[1]))
            event.locals.userId = payload.sub ?? null
        } catch {
            event.locals.userId = null
        }

        return resolve(event)
    }

    // No access token - try to refresh
    if (refreshToken) {
        try {
            const response = await fetch(`${API_URL}/api/auth/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            })

            if (response.ok) {
                const body = await response.json()

                // Re-set both cookies
                setAuthCookies(event.cookies, body.accessToken, body.refreshToken)

                event.locals.accessToken = body.accessToken

                try {
                    const payload = JSON.parse(atob(body.accessToken.split(".")[1]))
                    event.locals.userId = payload.sub ?? null
                } catch {
                    event.locals.userId = null
                }
            } else {
                // Refresh token is invalid/expired - clear everything
                event.cookies.delete("access_token", { path: "/" })
                event.cookies.delete("refresh_token", { path: "/" })
            }
        } catch {
          // API unreachable - proceed as unauthenticated
        }
    }

    return resolve(event)
}

// Track last visited page so we can redirect back after login
// Skip auth routes and bypass routes (e.g. /auth/callback has tokens in the URL)
const lastPathHook: Handle = async ({ event, resolve }) => {
    if (
        !building &&
        event.request.method === "GET" &&
        !isAuthRoute(event.url.pathname) &&
        !isBypassRoute(event.url.pathname)
    ) {
      event.cookies.set(
        "disq.lastPath",
        event.url.pathname + event.url.search,
        {
            path: "/",
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 10,   // 10 minutes
        }
      )
    }

    return resolve(event)
}

// Redirect logged-in users away from auth routes
// If user is on /login but already logged in send them back where they were
const authRouteGuardHook: Handle = async ({ event, resolve }) => {
    if (!event.locals.userId || !isAuthRoute(event.url.pathname))
        return resolve(event)

    // Check if there's an explicit redirectTo in the query string first
    const redirectTo = event.url.searchParams.get("redirectTo")
    if (redirectTo) throw redirect(302, decodeURIComponent(redirectTo))

    // Otherwise fall back to last visited path
    const lastPath = event.cookies.get("disq.lastPath") ?? "/servers/@me"
    throw redirect(302, lastPath)
}

// Protect private routes
const protectedRouteHook: Handle = async ({ event, resolve }) => {
    if (!isProtectedRoute(event.url.pathname))
        return resolve(event)

    if (!event.locals.userId)
        throw redirect(302, handleLoginRedirect(event))

    return resolve(event)
}


export const handle = sequence(
    tokenHook,            // Must be first to sets locals.userId + locals.accessToken
    lastPathHook,         // Track where user was before auth routes
    authRouteGuardHook,   // Logged-in users can't visit /login, /register etc.
    protectedRouteHook,   // Logged-out users can't visit /servers etc.
)
