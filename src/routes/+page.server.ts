import { auth } from '$lib/auth';
import type { PageServerLoad } from './$types';

export const load = (async ({ request }) => {

    const session = await auth.api.getSession({ headers: request.headers });
    
    return { session };
}) satisfies PageServerLoad;