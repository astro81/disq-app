import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
    const data = await parent();

    const currentServer = await data.currentServer;
    const currentServerChannelList = await data.currentServerChannelList;

    if (!currentServer) redirect(303, '/servers/@me');
    if (!currentServerChannelList) redirect(303, `/servers/${currentServer.serverId}`);

    // Find the channel with name 'general'
    const generalChannel = currentServerChannelList.find(
        (channel) => channel.channelName === 'general'
    );
    
    const generalChannelId = generalChannel?.channelId;
        
    // redirect if no general channel exists
    if (!generalChannelId) 
        redirect(303, `/servers/${currentServer.serverId}`);
    
    
    // Redirect to the general channel
    redirect(303, `/servers/${currentServer.serverId}/channels/${generalChannelId}`);

    return {};
}) satisfies PageServerLoad;