import type { RequestHandler } from './$types'
import { API_URL } from '$env/static/private'

export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
    const accessToken = cookies.get('access_token')
    if (!accessToken) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.formData()

    const res = await fetch(`${API_URL}/api/servers/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
    })

    const data = await res.json()
    return Response.json(data, { status: res.status })
}