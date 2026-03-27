// /api/servers/join/[inviteCode]

import { API_URL } from '$env/static/private';
import type { RequestHandler } from './$types';


export const POST: RequestHandler = async ({ cookies, fetch, params }) => {
    const accessToken = cookies.get('access_token')
    if (!accessToken) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { inviteCode } = params
    if (!inviteCode) return Response.json({ error: 'Server is not available' }, { status: 400 })

    const res = await fetch(`${API_URL}/api/servers/invite/${inviteCode}/join`, {
        method: 'POST', 
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    const data = await res.json()

    return Response.json(data, { status: res.status })
}