// /servers/[serverId]/layout.server.ts

import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'
import { getCurrentServer } from '$lib/remote/server/current-server.remote'
import { getCurrentServerChannelsList } from '$lib/remote/channel/current-channel.remote'
import { getCurrentMember, getCurrentMemberList } from '$lib/remote/member/current-member.remote'

export const load: LayoutServerLoad = async ({ params, cookies, parent }) => {
    const { serverId } = params
    const { user } = await parent()
    const accessToken = cookies.get('access_token')

    if (!user || !accessToken) redirect(303, '/login')

    const fetchCurrentServer = async (serverId : string ) => {
        const server = await getCurrentServer({ serverId });
        return server;
    };

    const fetchCurrentMember =  async (serverId : string ) => {
        const member = await getCurrentMember({ serverId });
        return member;
    };

    const fetchCurrentServerMembers =  async (serverId : string ) => {
        const memberList = await getCurrentMemberList({ serverId });
        return memberList;
    };

    const fetchCurrentServerChannels =  async (serverId : string ) => {
        const channelList = await getCurrentServerChannelsList({ serverId });
        return channelList;
    };

    return {
        currentServer: fetchCurrentServer(serverId),
        currentMember: fetchCurrentMember(serverId),
        currentServerChannelList: fetchCurrentServerChannels(serverId),
        currentServerMemberList: fetchCurrentServerMembers(serverId),
    }
}