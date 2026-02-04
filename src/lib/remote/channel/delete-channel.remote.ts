import { command } from "$app/server";
import { db } from "$lib/server/db";
import { channel } from "$lib/server/db/server-schema";
import { requireAuth, type User } from "$lib/server/utils/session-checker";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getAllServerChannelsList } from "./channel.remote";


export const deleteChannel = command(
    z.object({
        channelId: z.string(),
        serverId: z.string()
    }),
    async ({ channelId, serverId }) => {
        const user: User = requireAuth();

        // Check membership
        const existingMember = await db.query.member.findFirst({
            where: (m, { eq, and }) => and(eq(m.userId, user.id), eq(m.serverId, serverId))
        });

        if (!existingMember) throw error(404, "You are not a member of this server");

        // Only ADMIN can delete channels
        if (existingMember.role === "GUEST") throw error(403, "Only admins and moderators can delete channels");

        // Ensure channel belongs to server
        const existingChannel = await db.query.channel.findFirst({
            where: (c, { eq, and }) => and(eq(c.channelId, channelId), eq(c.serverId, serverId))
        });

        if (!existingChannel) throw error(404, "Channel not found");
        
        // Prevent deleting general channel
        if (existingChannel.channelName.toLowerCase() === "general") throw error(403, "The general channel cannot be deleted");

        await db.delete(channel).where(eq(channel.channelId, channelId));

        getAllServerChannelsList({ serverId }).refresh();
    }
);
