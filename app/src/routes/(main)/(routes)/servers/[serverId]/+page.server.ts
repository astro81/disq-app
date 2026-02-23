import { getFirstServerChannel } from '$lib/remote/channel/channel.remote';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const firstChannel = await getFirstServerChannel({ serverId: params.serverId });

    if (firstChannel) throw redirect(307, `/servers/${params.serverId}/channels/${firstChannel.channelId}`);

}) satisfies PageServerLoad;  