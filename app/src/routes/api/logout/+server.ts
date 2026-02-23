// src/routes/api/logout/+server.ts
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';


export const POST: RequestHandler = async ({ request }) => {
    await auth.api.signOut({ headers: request.headers });
    throw redirect(302, '/login');
};
