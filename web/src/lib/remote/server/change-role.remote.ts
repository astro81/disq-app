// change-role.remote.ts
import { command, getRequestEvent } from '$app/server';
import { API_URL } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { getCurrentMember, getCurrentMemberList } from '../member/current-member.remote';

export const changeMemberRole = command(
    z.object({
        serverId: z.string(),
        memberId: z.string(),
        role: z.enum(['ADMIN', 'MODERATOR', 'GUEST']),
    }),
    async ({ serverId, memberId, role }) => {
        const { cookies } = getRequestEvent();

        const accessToken = cookies.get('access_token');
        if (!accessToken) redirect(307, '/login');

        const res = await fetch(
            `${API_URL}/api/servers/${serverId}/members/${memberId}/role`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role }),
            }
        );

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
            throw error(res.status, data?.message ?? 'Failed to change member role');
        }

        await getCurrentMember({ serverId }).refresh();
        await getCurrentMemberList({ serverId }).refresh();

        return data.message as string;
    }
);