import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import { server, member } from "$lib/server/db/server-schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";


const requireAuth = () => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.session) redirect(307, '/login');

    return locals.user;
}


export const getJoinedServers = query(async () => {

    const user = await requireAuth();

    const joinedServers = await db
        .select({
            serverId: server.serverId,
            serverName: server.serverName,
            serverImageUrl: server.serverImageUrl,
            serverBannerImageUrl: server.serverBannerImageUrl,
            serverInviteCode: server.serverInviteCode,
            serverCreatedBy: server.createdBy,
            serverCreatedAt: server.createdAt,
            
            memberId: member.memberId,
            memberRole: member.role,
            memberJoinedAt: member.createdAt
        })
        .from(server)
        .innerJoin(member, eq(member.serverId, server.serverId))
        .where(eq(member.userId, user.id))


    return joinedServers;
})