import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { server } from "$lib/server/db/server-schema";
import { error, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { getCurrentServer } from "./server.remote";


const requireAuth = () => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.session) redirect(307, '/login');

    return locals.user;
}


export const inviteCode = command(z.object({ serverId: z.string() }), async({ serverId }) => {
    try {

        const user = requireAuth();

        const newInviteCode = crypto.randomUUID();

        const result = await db.update(server)
            .set({ serverInviteCode: newInviteCode })
            .where(
                and( eq(server.serverId, serverId), eq(server.createdBy, user.id) )
            ).returning({ id: server.serverId });

        if (!result) throw error(403, "Server not found or not owned by user");

        getCurrentServer({ serverId }).refresh();
        
    } catch (err) {
        console.log(`${serverId}`, err);
        throw error(500, "Internal Error");
    }
})