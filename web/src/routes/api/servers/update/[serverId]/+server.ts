// src/routes/api/servers/update/[serverId]/+server.ts
import type { RequestHandler } from './$types'
import { API_URL } from '$env/static/private'

/**
 * PATCH /api/servers/update/:serverId
 *
 * Proxies a multipart/form-data request from the SvelteKit frontend to the Bun/Hono backend,
 * forwarding the caller's access-token cookie as a Bearer header.
 *
 * Accepted form fields (all optional):
 *   serverName string
 *   serverDescription string   (empty string clears the description)
 *   serverImage File           (new server icon)
 *   serverBannerImage File     (new server banner)
 *   removeImage "true"         (delete current icon)
 *   removeBanner "true"        (delete current banner)
 */
export const PATCH: RequestHandler = async ({ cookies, request, params }) => {
    const accessToken = cookies.get('access_token')
    if (!accessToken)
        return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { serverId } = params
    if (!serverId)
        return Response.json({ error: 'Server ID is required' }, { status: 400 })

    // Forward the raw multipart body straight to the Bun API
    const body = await request.formData()

    const res = await fetch(`${API_URL}/api/servers/update/${serverId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body,
    })

    const data = await res.json()
    return Response.json(data, { status: res.status })
}