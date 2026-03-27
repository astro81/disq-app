import type { LayoutServerLoad } from './$types'
import { API_URL } from '$env/static/private'

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
    const accessToken = cookies.get('access_token')
    if (!accessToken) return { user: null }

    const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) return { user: null }

    const user = await res.json()
    return { user }
}