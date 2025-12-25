import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, RequestEvent } from './$types';
import { db } from '$lib/server/db';
import { and, eq } from "drizzle-orm";
import { member, server } from '$lib/server/db/server-schema';
import { getRequestEvent } from '$app/server';


const requireAuth = () => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.session) redirect(307, '/login');

    return locals.user;
}


export const load = (async ({ params }: RequestEvent) => {

    const user = requireAuth();

    if (!params.inviteCode) redirect(302, "/");

    // Check if user is already a member
    const [existingServer] = await db
        .select({ serverId: server.serverId })
        .from(server)
        .innerJoin(member, eq(member.serverId, server.serverId))
        .where(
            and( eq(server.serverInviteCode, params.inviteCode), eq(member.userId, user.id) )
        ).limit(1);
    
    
    // Already a member, redirect to server
    if (existingServer) redirect(303, `/servers/${existingServer.serverId}`)

    
    // Find the server by invite code
    const [inviteServer] = await db
        .select({ serverId: server.serverId })
        .from(server)
        .where(eq(server.serverInviteCode, params.inviteCode))
        .limit(1);

    // Invalid invite code
    if (!inviteServer) redirect(302, '/');


    // Add the current user as a member
    try {
        await db.insert(member).values({
            userId: user.id,
            serverId: inviteServer.serverId,
            role: 'GUEST',                          // default role
        });
    } catch (err: any) {
        // Ignore duplicate key error (race condition)
        if (!err.message.includes('members_unique_user_server')) {
            console.error('Failed to add member:', err);
            throw err; // rethrow unexpected errors
        }
    }

    redirect(303, `/servers/${inviteServer.serverId}`);
}) satisfies PageServerLoad;