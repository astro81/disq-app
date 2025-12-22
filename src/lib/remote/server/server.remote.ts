import { getRequestEvent, query } from "$app/server";
import { db } from "$lib/server/db";
import { server, member, channel } from "$lib/server/db/server-schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { invalid, redirect } from "@sveltejs/kit";
import { user } from "$lib/server/db/auth-schema";


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


export const getCurrentServer = query(z.object({ serverId: z.string() }), async ({ serverId }) => {

    const user = await requireAuth();

    const [currentServer] = await db
        .select()
        .from(server)
        .innerJoin(member, eq(member.serverId, server.serverId))
        .where(and(eq(server.serverId, serverId), eq(member.userId, user.id)));

    return currentServer;
})


export const getAllServerChannels = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    return await db
        .select({
            channelId: channel.channelId,
            channelName: channel.channelName,
            channelType: channel.channelType,
            position: channel.position,
            createdBy: channel.createdBy,
            createdAt: channel.createdAt,
            updatedAt: channel.updatedAt,
            creatorName: user.name, 
        })
        .from(channel)
        .leftJoin(user, eq(channel.createdBy, user.id))
        .where(eq(channel.serverId, serverId))
        .orderBy(channel.position);
})


export const getAllServerMembers = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    return await db
        .select({
            memberId: member.memberId,
            role: member.role,
            userId: user.id,
            userName: user.name, 
            joinedAt: member.createdAt,
        })
        .from(member)
        .leftJoin(user, eq(member.userId, user.id))
        .where(eq(member.serverId, serverId))
        .orderBy(member.role);

})