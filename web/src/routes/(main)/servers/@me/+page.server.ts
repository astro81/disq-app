import type { Actions, PageServerLoad } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { API_URL } from '$env/static/private'
import { clearAuthCookies } from '$lib/server/utils/manage-cookies'


export const load: PageServerLoad = async ({ parent }) => {
    const { user } = await parent()
    if (!user) redirect(302, '/login')
    return { user }
}

export const actions = {

    // Update text fields 
    updateProfile: async ({ request, cookies, fetch }) => {
        const accessToken = cookies.get('access_token')
        const data = await request.formData()

        const username = data.get('username')?.toString().trim() || undefined
        const email = data.get('email')?.toString().trim() || undefined
        const displayName = data.get('displayName')?.toString().trim() || undefined

        const response = await fetch(`${API_URL}/api/users/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ username, email, displayName }),
        })

        const body = await response.json()

        if (!response.ok) {
            if (body.field) return fail(response.status, { updateErrors: { [body.field]: body.error } })
            return fail(response.status, { updateError: body.error ?? 'Update failed' })
        }

        return { updateSuccess: true }
    },

    // Remove avatar
    removeAvatar: async ({ cookies, fetch }) => {
        const accessToken = cookies.get('access_token')

        const response = await fetch(`${API_URL}/api/users/me/avatar`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!response.ok) {
            const body = await response.json().catch(() => ({}))
            return fail(response.status, { avatarError: body.error ?? 'Failed to remove avatar' })
        }

        return { avatarRemoved: true }
    },

    // Remove banner
    removeBanner: async ({ cookies, fetch }) => {
        const accessToken = cookies.get('access_token')

        const response = await fetch(`${API_URL}/api/users/me/banner`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!response.ok) {
            const body = await response.json().catch(() => ({}))
            return fail(response.status, { bannerError: body.error ?? 'Failed to remove banner' })
        }

        return { bannerRemoved: true }
    },

    // Delete account
    deleteAccount: async ({ cookies, fetch }) => {
        const accessToken = cookies.get('access_token')
        const refreshToken = cookies.get('refresh_token')

        const response = await fetch(`${API_URL}/api/users/me`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!response.ok) {
            const body = await response.json().catch(() => ({}))
            return fail(response.status, { deleteError: body.error ?? 'Failed to delete account' })
        }

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
    },

} satisfies Actions