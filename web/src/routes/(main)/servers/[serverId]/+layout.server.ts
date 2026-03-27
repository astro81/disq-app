// /servers/[serverId]/layout.server.ts

import { error, redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { API_URL } from '$env/static/private'

export const load: LayoutServerLoad = async ({ params, fetch, cookies, parent }) => {
    const { serverId } = params
    const { user } = await parent()
    const accessToken = cookies.get('access_token')

    if (!user || !accessToken) redirect(303, '/login')

    const headers = { Authorization: `Bearer ${accessToken}` }

    const fetchCurrentServer = async (serverId : string ) => {
        const serverResponse = await fetch(`${API_URL}/api/servers/${serverId}`, { headers });

        if (serverResponse.status === 404) error(404, 'Server not found')
        if (serverResponse.status === 403) error(403, 'Access denied')
        if (!serverResponse.ok) error(500, 'Failed to load server')

        return serverResponse.json();
    };

    const fetchCurrentMember =  async (serverId : string ) => {
        const currentMemberResponse = await fetch(`${API_URL}/api/servers/${serverId}/currentMember`, { headers });
        return currentMemberResponse.json();
    };

    const fetchCurrentServerMembers =  async (serverId : string ) => {
        const membersResponse = await fetch(`${API_URL}/api/servers/${serverId}/members`, { headers });
        return membersResponse.ok ? membersResponse.json() : []
    };

    const fetchCurrentServerChannels =  async (serverId : string ) => {
        const channelsResponse = await fetch(`${API_URL}/api/channels?serverId=${serverId}`, { headers });
        return channelsResponse.ok ? channelsResponse.json() : []
    };

    return {
        currentServer: fetchCurrentServer(serverId),
        currentMember: fetchCurrentMember(serverId),
        currentServerChannelList: fetchCurrentServerChannels(serverId),
        currentServerMemberList: fetchCurrentServerMembers(serverId),
    }
}