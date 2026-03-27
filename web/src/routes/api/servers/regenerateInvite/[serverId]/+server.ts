import type { RequestHandler } from './$types'
import { API_URL } from '$env/static/private'

export const PATCH: RequestHandler = async ({ cookies, fetch, params }) => {
    const accessToken = cookies.get('access_token')
    if (!accessToken) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { serverId } = params
    if (!serverId) return Response.json({ error: 'Server is not available' }, { status: 400 })

    const res = await fetch(`${API_URL}/api/servers/invite/${serverId}`, {
        method: 'PATCH', 
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    const data = await res.json()

    return Response.json(data, { status: res.status })
}