// /invite/[inviteCode]/+page.server.ts

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, fetch, cookies }) => {

    const { inviteCode } = params;
    const accessToken = cookies.get('access_token');

    if (!inviteCode) redirect(302, '/');
    if (!accessToken) redirect(307, '/login');

    const response = await fetch(`/api/servers/join/${inviteCode}`, {
        method: 'POST',
    });

    if (response.status === 401) redirect(307, '/login');
    if (response.status === 404) redirect(302, '/');
    if (!response.ok) redirect(302, '/');

    const data = await response.json();

    redirect(303, `/servers/${data.serverId}`);

}) satisfies PageServerLoad;