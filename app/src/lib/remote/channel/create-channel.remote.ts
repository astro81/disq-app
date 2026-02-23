import { form } from "$app/server";
import { db } from "$lib/server/db";
import { channel } from "$lib/server/db/server-schema";
import { requireAuth } from "$lib/server/utils/session-checker";
import { invalid } from "@sveltejs/kit";
import { eq, max } from "drizzle-orm";
import { z } from "zod";


export const createChannel = form(
    z.object({
        channelName: z.string().min(2).max(50),
        channelType: z.enum(["TEXT", "VOICE", "VIDEO"]),
        serverId: z.string()
    }),
    async({ channelName, channelType, serverId }, issue) => {
        const user = requireAuth();


        // Permission check
        const member = await db.query.member.findFirst({
             where: (m, { eq, and }) => and(eq(m.userId, user.id), eq(m.serverId, serverId)),
        });

        if (!member || member.role === "GUEST") invalid(issue("You do not have permission to create channels"));


        try {
            // determine next position
            const [row] = await db
              .select({ pos: max(channel.position) })
              .from(channel)
              .where(eq(channel.serverId, serverId));

            const position = (row?.pos ?? 0) + 1;

            await db.insert(channel).values({
              channelName,
              channelType,
              serverId,
              position,
              createdBy: user.id,
            });
        } catch (error: any) {
            if (
                error?.code === "23505" &&
                error?.constraint === "channel_unique_name_per_server"
            ) {
                invalid(issue.channelName("A channel with this name already exists"));
            }
        
            console.error(error);
            invalid(issue("Failed to create channel. Please try again."));
        }
    }
);