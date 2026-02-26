import { query } from "$app/server";
import { db } from "$lib/server/db";
import { server, member } from "$lib/server/db/server-schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireAuth } from "$lib/server/utils/session-checker";


export const getJoinedServers = query(async () => {

    const user = requireAuth();

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


export const getCurrentServer = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    const currentServer = await db.query.server.findFirst({
        columns: {
            serverId: true,
            serverName: true,
            serverDescription: true,
            serverImageUrl: true,
            serverBannerImageUrl: true,
            serverInviteCode: true,
            createdBy: true,
            createdAt: true,
            updatedAt: true,
        },
        where: eq(server.serverId, serverId)
    });

    if (!currentServer) throw new Error("Server not found!");
    
    return currentServer;
})
