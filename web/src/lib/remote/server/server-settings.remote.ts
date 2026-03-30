import { command, getRequestEvent } from '$app/server'
import { API_URL } from '$env/static/private'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { getCurrentServer } from './current-server.remote'
import { getPublicServers } from './discover.remote'
import { getCurrentMember } from '../member/current-member.remote'

export const updateServer = command(
    z.object({
        serverId: z.string(),
        serverName: z.string().optional(),
        serverDescription: z.string().optional(),
        isPrivateServer: z.boolean().optional(),
        removeImage: z.boolean().optional(),
        removeBanner: z.boolean().optional(),
        // base64-encoded file contents + mime type
        serverImage: z.object({ data: z.string(), mimeType: z.string(), fileName: z.string() }).optional(),
        serverBannerImage: z.object({ data: z.string(), mimeType: z.string(), fileName: z.string() }).optional(),
    }),
    async ({ serverId, serverName, serverDescription, isPrivateServer, removeImage, removeBanner, serverImage, serverBannerImage }) => {
        const { cookies } = getRequestEvent()
        const accessToken = cookies.get('access_token')

        if (!accessToken) redirect(307, '/login')

        const form = new FormData()

        if (serverName !== undefined) form.append('serverName', serverName)
        if (serverDescription !== undefined) form.append('serverDescription', serverDescription)
        if (isPrivateServer !== undefined) form.append('isPrivateServer', isPrivateServer.toString())
        if (removeImage) form.append('removeImage', 'true')
        if (removeBanner) form.append('removeBanner', 'true')

        if (serverImage) {
            const bytes = Uint8Array.from(atob(serverImage.data), c => c.charCodeAt(0))
            form.append('serverImage', new Blob([bytes], { type: serverImage.mimeType }), serverImage.fileName)
        }

        if (serverBannerImage) {
            const bytes = Uint8Array.from(atob(serverBannerImage.data), c => c.charCodeAt(0))
            form.append('serverBannerImage', new Blob([bytes], { type: serverBannerImage.mimeType }), serverBannerImage.fileName)
        }

        const res = await fetch(`${API_URL}/api/servers/update/${serverId}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form,
        })

        const text = await res.text()
        const data = text ? JSON.parse(text) : {}

        if (!res.ok) {
            throw error(res.status, data.error ?? 'Failed to update server settings')
        }

        await getCurrentServer({ serverId }).refresh();
        await getPublicServers().refresh();
        await getCurrentMember({ serverId }).refresh();        

        return data as { server: { serverName: string; serverDescription: string; isPrivateServer: boolean; serverImageUrl: string; serverBannerImageUrl: string } }
    }
)