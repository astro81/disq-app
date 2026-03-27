// src/routes/api/channels/+server.ts
import { API_URL } from '$env/static/private'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, cookies }) => {
    const accessToken = cookies.get('access_token')
    const body = await request.json()

    const res = await fetch(`${API_URL}/api/channels`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
    })
}