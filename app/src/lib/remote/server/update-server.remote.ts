import { command } from "$app/server";
import { db } from "$lib/server/db";
import { server } from "$lib/server/db/server-schema";
import { requireAuth, type User } from "$lib/server/utils/session-checker";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { z } from "zod";


export const updateServer = command(
    z.object({
        serverId: z.string(),
        serverName: z.string().min(3, "Server name must be at least 3 characters").optional(),
        serverDescription: z.string().nullable().optional(),
        serverImage: z.string().url("Invalid image URL").optional(),
        serverBannerImage: z.string().url("Invalid banner image URL").nullable().optional(),
    }),
    async ({ serverId, serverName, serverDescription, serverImage, serverBannerImage }) => {
        const user: User = requireAuth();

        // Check membership
        const existingMember = await db.query.member.findFirst({
            where: (m, { eq, and }) =>
                and(eq(m.userId, user.id), eq(m.serverId, serverId))
        });

        if (!existingMember) throw error(404, "You are not a member of this server");
        if (existingMember.role !== "ADMIN") throw error(403, "Only admins can update server settings");

        // Build update payload with only provided fields
        const updates: Record<string, unknown> = {};

        if (serverName !== undefined) updates.serverName = serverName;
        if (serverDescription !== undefined) updates.serverDescription = serverDescription;
        if (serverImage !== undefined) updates.serverImageUrl = serverImage;
        if (serverBannerImage !== undefined) updates.serverBannerImageUrl = serverBannerImage;

        if (Object.keys(updates).length === 0) return;

        await db.update(server).set(updates).where(eq(server.serverId, serverId));
    }
)
