import { form } from "$app/server";
import { db } from "$lib/server/db";
import { channel } from "$lib/server/db/server-schema";
import { requireAuth } from "$lib/server/utils/session-checker";
import { invalid } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { z } from "zod";



export const editChannel = form(
    z.object({
        channelId: z.string(),
        channelName: z.string().min(2).max(50),
        channelType: z.enum(["TEXT", "VOICE", "VIDEO"]),
        serverId: z.string()
    }),
    async ({ channelId, channelName, channelType, serverId }, issue) => {
        const user = requireAuth();

        // Membership + permission
        const member = await db.query.member.findFirst({
            where: (m, { eq, and }) => and(eq(m.userId, user.id), eq(m.serverId, serverId))
        });

        if (!member || member.role === "GUEST") invalid(issue("You do not have permission to edit channels"));

        // Fetch channel
        const existingChannel = await db.query.channel.findFirst({
            where: (c, { eq, and }) => and(eq(c.channelId, channelId), eq(c.serverId, serverId))
        });

        if (!existingChannel) invalid(issue("Channel not found"));
        
        // Protect #general
        if (existingChannel.channelName.toLowerCase() === "general" && channelName.toLowerCase() !== "general") {
            invalid(issue.channelName("The general channel cannot be renamed"));
        }

        try {
            await db
                .update(channel)
                .set({
                    channelName,
                    channelType,
                    updatedAt: new Date()
                })
                .where(eq(channel.channelId, channelId));
        } catch (error: any) {
            if (
                error?.code === "23505" &&
                error?.constraint === "channel_unique_name_per_server"
            ) {
                invalid(issue.channelName("A channel with this name already exists"));
            }

            console.error(error);
            invalid(issue("Failed to update channel. Please try again."));
        }
    }
);
