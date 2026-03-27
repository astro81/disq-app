import type { PageServerLoad, Actions } from './$types'
import { fail, redirect } from '@sveltejs/kit'
import { API_URL } from '$env/static/private'

export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
    const { user } = await parent()
    const accessToken = cookies.get('access_token')

    const serversRes = await fetch(`${API_URL}/api/servers`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })

    if (!serversRes.ok) return { servers: [], joinedServerIds: [] }

    const servers = await serversRes.json()

    let joinedServerIds: string[] = []

    if (user && accessToken) {
        const joinedRes = await fetch(`${API_URL}/api/servers/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (joinedRes.ok) {
            const joined = await joinedRes.json() as { serverId: string }[]
            joinedServerIds = joined.map(j => j.serverId)
        }
    }

    return { servers, joinedServerIds }
}

export const actions = {
    join: async ({ request, cookies, fetch }) => {
        const accessToken = cookies.get('access_token')
        if (!accessToken) redirect(302, '/login')

        const data = await request.formData()
        const serverId = data.get('serverId')?.toString()

        if (!serverId) return fail(400, { error: 'Missing server ID' })

        const res = await fetch(`${API_URL}/api/servers/${serverId}/join`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        // Safely parse JSON - a 500 from the server may return plain text
        const body = await res.json().catch(() => ({ error: 'Server error' }))

        // 409 = already a member, redirect anyway
        if (!res.ok && res.status !== 409) {
            return fail(res.status, { error: body.error ?? 'Failed to join server' })
        }

        redirect(302, `/servers/${serverId}`)
    },
} satisfies Actions