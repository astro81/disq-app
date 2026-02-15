import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { getFirstServerChannel, getServerChannel } from '$lib/remote/channel/channel.remote';
import { getCurrentServerUserMember } from '$lib/remote/member/member.remote';


export const load = (async ({ params }) => {

    let channel = await getServerChannel({ channelId: params.channelId });

    let member = await getCurrentServerUserMember({ 
        serverId: params.serverId,
    });

    const firstChannel = await getFirstServerChannel({ serverId: params.serverId });
    
    if ((!channel || !member) && firstChannel) 
        throw redirect(307, `/servers/${params.serverId}/channels/${firstChannel.channelId}`);


    return { channel, member };
}) satisfies PageServerLoad;