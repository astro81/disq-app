import { getAllServerChannelsList } from '$lib/remote/channel/channel.remote';
import { getCurrentServerUserMember, getServerMembersList } from '$lib/remote/member/member.remote';
import { getCurrentServer } from '$lib/remote/server/server.remote';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ params }) => {

    const serverId = params.serverId;

    const fetchCurrentServer = async (serverId : string ) => {
        const server = await getCurrentServer({ serverId });
        return server;
    };

    const fetchCurrentMember = async (serverId: string) => {
        const member = await getCurrentServerUserMember({ serverId });
        return member;
    }

    const fetchCurrentServerChannelsList = async(serverId: string) => {
        const channelList = await getAllServerChannelsList({ serverId });
        return channelList;
    }

    const fetchCurrentServerAllMembersList = async(serverId: string) => {
        const memberList = await getServerMembersList({ serverId });
        return memberList;
    }

    return {
        currentServer: fetchCurrentServer(serverId),
        currentMember: fetchCurrentMember(serverId),
        currentServerChannelsList: fetchCurrentServerChannelsList(serverId),
        currentServerMemberList: fetchCurrentServerAllMembersList(serverId),
    };
}) satisfies LayoutServerLoad;