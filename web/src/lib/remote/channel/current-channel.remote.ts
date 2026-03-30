// $lib/remote/channel/current-channel.remote.ts
import { command, getRequestEvent, query } from "$app/server";
import { API_URL } from "$env/static/private";
import { error, redirect } from "@sveltejs/kit";
import z from "zod";
import { getPublicServers } from "../server/discover.remote";
import { getCurrentServer } from "../server/current-server.remote";


export const getCurrentServerChannelsList = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    const { cookies } = getRequestEvent();
    
    const accessToken = cookies.get('access_token');
    if (!accessToken) redirect(307, '/login');

    const channelsResponse = await fetch(`${API_URL}/api/channels?serverId=${serverId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (channelsResponse.status === 404) throw new Error ('Channels not found')
    if (channelsResponse.status === 403) throw new Error ('Access denied')
    if (!channelsResponse.ok) throw new Error ('Failed to load channels')

    return channelsResponse.ok ? channelsResponse.json() : []
})

export const getChannel = query(z.object({ channelId: z.string() }), async ({ channelId }) => {
    const { cookies } = getRequestEvent();
    
    const accessToken = cookies.get('access_token');
    if (!accessToken) redirect(307, '/login');

    const channelResponse = await fetch(`${API_URL}/api/channels/${channelId}`, {         
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (channelResponse.status === 404) throw new Error ('Channels not found')
    if (channelResponse.status === 403) throw new Error ('Access denied')
    if (!channelResponse.ok) throw new Error ('Failed to load channels')

    return channelResponse.json() 
})

export const getChannelAccessList = query(
    z.object({ channelId: z.string() }),
    async ({ channelId }) => {
        const { cookies } = getRequestEvent();
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) redirect(307, '/login');

        const response = await fetch(`${API_URL}/api/channels/${channelId}/access`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status === 404) return [];
        if (!response.ok) throw new Error('Failed to load channel access list');

        return response.json();
    }
)

export const createChannel = command(
    z.object({
        channelName: z.string(),
        channelType: z.string(),
        serverId: z.string(),
        isPrivateChannel: z.boolean(),
    }),
    async ({ channelName, channelType, serverId, isPrivateChannel }) => {
        const { cookies } = getRequestEvent()
        const accessToken = cookies.get('access_token')

        if (!accessToken) redirect(307, '/login')

        const res = await fetch(`${API_URL}/api/channels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ channelName, channelType, serverId, isPrivateChannel }),
        })

        let data = {};
        try {
            const text = await res.text();
            data = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            data = { error: await res.text() };
        }

        if (!res.ok) {
            throw error(res.status, data.error ?? 'Failed to create channel');
        }

        await getCurrentServer({ serverId }).refresh();
        await getPublicServers().refresh();
        await getCurrentServerChannelsList({ serverId }).refresh();

        return data;
    }
)

export const editChannel = command(
    z.object({
        channelId: z.string(),
        channelName: z.string().optional(),
        channelType: z.string().optional(),
        isPrivateChannel: z.boolean().optional(),
    }),
    async ({ channelId, channelName, channelType, isPrivateChannel }) => {
        const { cookies } = getRequestEvent()
        const accessToken = cookies.get('access_token')

        if (!accessToken) redirect(307, '/login')

        const res = await fetch(`${API_URL}/api/channels/${channelId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ 
                ...(channelName !== undefined && { channelName }),
                ...(channelType !== undefined && { channelType }),
                ...(isPrivateChannel !== undefined && { isPrivateChannel }),
            }),
        })

        let data = {};
        try {
            const text = await res.text();
            data = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            data = { error: await res.text() };
        }

        if (!res.ok) {
            throw error(res.status, data.error ?? 'Failed to edit channel');
        }

        // Get serverId from the channel to refresh the channels list
        let serverId = '';
        try {
            const channelData = await getChannel({ channelId });
            serverId = channelData.serverId;
        } catch (e) {
            console.error('Failed to get channel for refresh:', e);
        }

        if (serverId) {
            await getCurrentServerChannelsList({ serverId }).refresh();
        }

        return data;
    }
)

export const deleteChannel = command(
    z.object({
        channelId: z.string(),
    }),
    async ({ channelId }) => {
        const { cookies } = getRequestEvent()
        const accessToken = cookies.get('access_token')

        if (!accessToken) redirect(307, '/login')

        // First get the channel to know the serverId for refresh
        let serverId = '';
        try {
            const channelData = await getChannel({ channelId });
            serverId = channelData.serverId;
        } catch (e) {
            console.error('Failed to get channel before delete:', e);
        }

        const res = await fetch(`${API_URL}/api/channels/${channelId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        let data = {};
        try {
            const text = await res.text();
            data = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            data = { error: await res.text() };
        }

        if (!res.ok) {
            throw error(res.status, data.error ?? 'Failed to delete channel');
        }

        // Refresh the channels list after deletion
        if (serverId) {
            await getCurrentServerChannelsList({ serverId }).refresh();
        }

        return data;
    }
)

export const reorderChannel = command(
    z.object({
        channelId: z.string(),
        direction: z.enum(['up', 'down']).optional(),
        position: z.number().optional(),
    }),
    async ({ channelId, direction, position }) => {
        const { cookies } = getRequestEvent()
        const accessToken = cookies.get('access_token')

        if (!accessToken) redirect(307, '/login')

        const body: { direction?: 'up' | 'down'; position?: number } = {};
        if (direction) body.direction = direction;
        if (position !== undefined) body.position = position;

        const res = await fetch(`${API_URL}/api/channels/${channelId}/position`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        let data = {};
        try {
            const text = await res.text();
            data = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            data = { error: await res.text() };
        }

        if (!res.ok) {
            throw error(res.status, data.error ?? 'Failed to reorder channel');
        }

        // Get serverId to refresh channels list
        let serverId = '';
        try {
            const channelData = await getChannel({ channelId });
            serverId = channelData.serverId;
        } catch (e) {
            console.error('Failed to get channel for refresh:', e);
        }

        if (serverId) {
            await getCurrentServerChannelsList({ serverId }).refresh();
        }

        return data;
    }
)

export const manageChannelAccess = command(
    z.object({
        channelId: z.string(),
        memberId: z.string(),
        grant: z.boolean(),
    }),
    async ({ channelId, memberId, grant }) => {
        const { cookies } = getRequestEvent()
        const accessToken = cookies.get('access_token')

        if (!accessToken) redirect(307, '/login')

        const res = await fetch(`${API_URL}/api/channels/${channelId}/access`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ memberId, grant }),
        })

        let data = {};
        try {
            const text = await res.text();
            data = text ? JSON.parse(text) : {};
        } catch (parseError) {
            console.error('Failed to parse response as JSON:', parseError);
            data = { error: await res.text() };
        }

        if (!res.ok) {
            throw error(res.status, data.error ?? 'Failed to manage channel access');
        }

        // Refresh the channels list to update access
        let serverId = '';
        try {
            const channelData = await getChannel({ channelId });
            serverId = channelData.serverId;
        } catch (e) {
            console.error('Failed to get channel for refresh:', e);
        }

        if (serverId) {
            await getCurrentServerChannelsList({ serverId }).refresh();
        }

        return data;
    }
)