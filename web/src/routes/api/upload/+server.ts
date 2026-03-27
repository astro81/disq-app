import type { RequestHandler } from './$types'
import { API_URL } from '$env/static/private'

/**
 * POST /api/upload
 *
 * Receives multipart/form-data { file: File, type: "avatar" | "banner" }
 * from the browser. Forwards the file to the appropriate Hono endpoint
 * with the httpOnly access token attached.
 *
 * All Cloudinary logic lives in Hono - this is purely a token-bearing proxy.
 */
export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
    const accessToken = cookies.get('access_token')

    if (!accessToken)
        return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const incoming = await request.formData()
    const file = incoming.get('file') as File | null
    const type = incoming.get('type')?.toString()

    if (!file)
        return Response.json({ error: 'No file provided' }, { status: 400 })
    if (!type || !['avatar', 'banner'].includes(type))
        return Response.json({ error: 'Invalid type - must be "avatar" or "banner"' }, { status: 400 })

    // Forward the file as multipart to Hono
    const outgoing = new FormData()
    outgoing.append('file', file)

    const res = await fetch(`${API_URL}/api/users/me/${type}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: outgoing,
    })

    const body = await res.json()

    if (!res.ok)
        return Response.json({ error: body.error ?? 'Upload failed' }, { status: res.status })

    return Response.json({ imageUrl: body.imageUrl })
}