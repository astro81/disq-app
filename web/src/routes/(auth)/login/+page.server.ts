import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { API_URL } from '$env/static/private';
import { setAuthCookies } from '$lib/server/utils/manage-cookies';

export const load: PageServerLoad = async ({ cookies, url }) => {
    if (cookies.get('access_token')) redirect(302, '/servers/@me')
    
    const message = url.searchParams.get('message')
    return { oauthError: message }
};

export const actions = {
    signInEmail: async ({ request, fetch, cookies, url }) => {
        const data = await request.formData();
        const identifier = data.get('identifier')?.toString().trim() ?? '';
        const password = data.get('password')?.toString() ?? '';

        if (!identifier) return fail(400, { message: 'Username or email is required' });
  	  	if (!password) return fail(400, { message: 'Password is required' });

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const body = await response.json();

            if (!response.ok) {
                if (body.field) return fail(response.status, { errors: { [body.field]: body.error } })
                return fail(response.status, { message: body.error ?? 'Login failed' })
            }

            setAuthCookies(cookies, body.accessToken, body.refreshToken)


            // Respect redirectTo param, then lastPath cookie, then default
            const redirectTo = url.searchParams.get("redirectTo")
            redirect(302, redirectTo ? decodeURIComponent(redirectTo) : "/servers/@me")
        } catch {
            return fail(500, { message: 'Authentication server is unreachable.' });
        }

    },
    
    signInGithub: async () => {
        redirect(302, `${API_URL}/api/auth/oauth/github`)
    },
 
    signInGoogle: async () => {
        redirect(302, `${API_URL}/api/auth/oauth/google`)
    },
} satisfies Actions;