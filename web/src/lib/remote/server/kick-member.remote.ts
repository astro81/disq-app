// kick-member.remote.ts
import { command, getRequestEvent } from '$app/server';
import { API_URL } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { getCurrentMember, getCurrentMemberList } from '../member/current-member.remote';
import { getPublicServers } from './discover.remote';

export const kickServerMember = command(
    z.object({
        serverId: z.string(),
        memberId: z.string(),
    }),
    async ({ serverId, memberId }) => {
        const { cookies } = getRequestEvent();

        const accessToken = cookies.get('access_token');
        if (!accessToken) redirect(307, '/login');

        const res = await fetch(
            `${API_URL}/api/servers/${serverId}/members/${memberId}/kick`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
            throw error(res.status, data?.message ?? 'Failed to kick member');
        }

        await getPublicServers().refresh();
        await getCurrentMember({ serverId }).refresh();
        await getCurrentMemberList({ serverId }).refresh();

        return data.message as string;
    }
);