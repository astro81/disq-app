import { command, query, getRequestEvent } from '$app/server';
import { API_URL } from '$env/static/private';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { getCurrentServer } from './current-server.remote';
import { getCurrentMember, getCurrentMemberList } from '../member/current-member.remote';

export const getPublicServers = query(async () => {
    const { cookies } = getRequestEvent();
    const accessToken = cookies.get('access_token');

    const res = await fetch(`${API_URL}/api/servers`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    if (!res.ok) return { servers: [], joinedServerIds: [] };

    const servers = await res.json();

    let joinedServerIds: string[] = [];

    if (accessToken) {
        const joinedRes = await fetch(`${API_URL}/api/servers/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (joinedRes.ok) {
            const joined = await joinedRes.json() as { serverId: string }[];
            joinedServerIds = joined.map(j => j.serverId);
        }
    }

    return { servers, joinedServerIds };
});

export const joinServer = command(
    z.object({ serverId: z.string() }),
    async ({ serverId }) => {
        const { cookies } = getRequestEvent();
        const accessToken = cookies.get('access_token');

        if (!accessToken) redirect(307, '/login');

        const res = await fetch(`${API_URL}/api/servers/${serverId}/join`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const text = await res.text();
        const body = text ? JSON.parse(text) : {};

        if (!res.ok && res.status !== 409) {
            throw error(res.status, body.error ?? 'Failed to join server');
        }

        await getCurrentServer({ serverId }).refresh();
        await getPublicServers().refresh();
        await getCurrentMember({ serverId }).refresh();
        await getCurrentMemberList({ serverId }).refresh();

        redirect(302, `/servers/${serverId}`);
    }
);