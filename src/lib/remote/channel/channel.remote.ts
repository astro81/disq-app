import { query } from "$app/server";
import { db } from "$lib/server/db";
import { channel } from "$lib/server/db/server-schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { user } from "$lib/server/db/auth-schema";


export const getAllServerChannelsList = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    return await db
        .select({
            channelId: channel.channelId,
            channelName: channel.channelName,
            channelType: channel.channelType,
            position: channel.position,
            serverId: channel.serverId,
            createdBy: channel.createdBy,
            createdAt: channel.createdAt,
            updatedAt: channel.updatedAt,
        })
        .from(channel)
        .where(eq(channel.serverId, serverId))
        .orderBy(channel.position);
});


export const getFirstServerChannel = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    const firstChannel = await db.query.channel.findFirst({
        columns: { channelId: true },
        where: and(
            eq(channel.channelName, "general"),
            eq(channel.serverId, serverId)
        ),
    });

    if (!firstChannel) throw new Error('Channel not found');
        
    return firstChannel;
});


export const getServerChannel = query(z.object({ channelId: z.string() }), async ({ channelId }) => {
    const currentChannel = await db.query.channel.findFirst({
        columns: {
            channelId: true,
            channelName: true,
            channelType: true,
            position: true,
            serverId: true,
            createdBy: true,
            createdAt: true,
            updatedAt: true,
        },
        where: eq(channel.channelId, channelId) 
    });

    if (!currentChannel) throw new Error('Channel not found');
        
    return currentChannel;
});