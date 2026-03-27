import type { RequestHandler } from './$types'
import { API_URL } from '$env/static/private'
import { error } from '@sveltejs/kit'

export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
    const accessToken = cookies.get('access_token')
    if (!accessToken) error(401, 'Unauthorized')

    const formData = await request.formData()
    
    const file = formData.get('file') as File | null
    
    if (!file) error(400, 'No file provided')

    const outgoing = new FormData()
    
    outgoing.append('file', file)

    const res = await fetch(`${API_URL}/api/attachments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: outgoing,
    })

    const body = await res.json()
    
    if (!res.ok) error(res.status, body.error ?? 'Upload failed')

    return Response.json(body)
}