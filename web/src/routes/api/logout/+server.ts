import { clearAuthCookies } from '$lib/server/utils/manage-cookies';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { API_URL } from '$env/static/private';


export const POST: RequestHandler = async ({ cookies, fetch }) => {
    const refreshToken = cookies.get('refresh_token')
    const accessToken = cookies.get('access_token')
    
    if (refreshToken) {
        await fetch(`${API_URL}/api/users/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }),
        }).catch(() => null)
    }
    
    clearAuthCookies(cookies)
    redirect(302, '/login')
};
