import { command, getRequestEvent } from '$app/server'
import { API_URL } from '$env/static/private'
import { error, redirect } from '@sveltejs/kit'
import { z } from 'zod'
import { getCurrentServer } from './current-server.remote'

export const regenerateInviteCode = command(
    z.object({ serverId: z.string() }),
    async ({ serverId }) => {
        const { cookies } = getRequestEvent()
        const accessToken = cookies.get('access_token')

        if (!accessToken) redirect(307, '/login')

        const res = await fetch(`${API_URL}/api/servers/invite/${serverId}`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        const text = await res.text()
        const data = text ? JSON.parse(text) : {}

        if (!res.ok) {
            throw error(res.status, data.error ?? 'Failed to regenerate invite code')
        }

        await getCurrentServer({ serverId }).refresh();        

        return data as { serverInviteCode: string }
    }
)