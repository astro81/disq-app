import { auth } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {

    const user = await locals.user;
    
    return { user };
}) satisfies PageServerLoad;