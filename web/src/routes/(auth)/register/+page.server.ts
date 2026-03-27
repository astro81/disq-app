import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { API_URL } from '$env/static/private';
import { setAuthCookies } from '$lib/server/utils/manage-cookies';


// Redirect already-logged-in users away from register page
export const load: PageServerLoad = async ({ cookies }) => {
    if (cookies.get('access_token')) redirect(302, '/servers/@me')

	return {};
};


export const actions = {
  	signUpEmail: async ({ request, fetch, cookies }) => {
  	  	const data = await request.formData();

  	  	const username = data.get('username')?.toString().trim() ?? '';
  	  	const email = data.get('email')?.toString().trim() ?? '';
  	  	const password = data.get('password')?.toString() ?? '';
  	  	const confirmPassword = data.get('confirm-password')?.toString() ?? '';
        const displayName = data.get('display-name')?.toString().trim() || username


  	  	// Validate before hitting the API
  		if (!username) return fail(400, { message: 'Username is required' });

  	  	if (!email) return fail(400, { message: 'Email is required' });

  	  	if (!password) return fail(400, { message: 'Password is required' });

  	  	if (password !== confirmPassword) return fail(400, { message: 'Passwords do not match' });

  	  	if (password.length < 8) return fail(400, { message: 'Password must be at least 8 characters' });

  	  	// POST to Hono register endpoint
		try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, displayName }),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                return fail(500, { message: 'Backend returned non-JSON response. Check API URL.' });
            }

            const body = await response.json();

			if (!response.ok) {
                // If the backend specifies a field, return a structured error
                if (body.field) {
                    return fail(response.status, { 
                        errors: { [body.field]: body.error } 
                    });
                }
                // Fallback for generic errors (like 500s)
                return fail(response.status, { message: body.error ?? 'Registration failed' });
            }

            setAuthCookies(cookies, body.accessToken, body.refreshToken)

        } catch (err) {
            console.error('Register Error:', err);
            return fail(500, { message: 'Could not connect to the authentication server.' });
        }

        throw redirect(302, '/servers/@me');

  	},

    signUpGithub: async () => {
        redirect(302, `${API_URL}/api/auth/oauth/github`)
    },
 
    signUpGoogle: async () => {
        redirect(302, `${API_URL}/api/auth/oauth/google`)
    },

} satisfies Actions;