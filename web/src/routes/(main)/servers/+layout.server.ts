// servers/layout.server.ts
import type { LayoutServerLoad } from './$types'
import { API_URL } from '$env/static/private'

export const load: LayoutServerLoad = async ({ cookies, fetch, parent }) => {
    const { user } = await parent()
    const accessToken = cookies.get('access_token')

    if (!user || !accessToken) return { joinedServers: [] }

    // Fetch the server IDs the user has joined
    const membershipsRes = await fetch(`${API_URL}/api/servers/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!membershipsRes.ok) return { joinedServers: [] }

    const memberships = await membershipsRes.json() as { serverId: string }[]

    if (memberships.length === 0) return { joinedServers: [] }

    // Fetch full server details for each membership
    // The public GET /api/servers only returns public ones, so we fetch
    // each server individually to also get private ones the user belongs to.
    const serverRequests = memberships.map(({ serverId }) =>
        fetch(`${API_URL}/api/servers/${serverId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).then(r => r.ok ? r.json() : null)
    )

    const results = await Promise.all(serverRequests)
    const joinedServers = results.filter(Boolean)

    return { joinedServers }
}