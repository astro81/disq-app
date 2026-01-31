import { query } from "$app/server";
import { db } from "$lib/server/db";
import { channel } from "$lib/server/db/server-schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
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
            creatorName: user.name, 
        })
        .from(channel)
        .leftJoin(user, eq(channel.createdBy, user.id))
        .where(eq(channel.serverId, serverId))
        .orderBy(channel.position);
});
