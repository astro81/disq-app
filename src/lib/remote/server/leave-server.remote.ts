import { command } from "$app/server";
import { db } from "$lib/server/db";
import { member } from "$lib/server/db/server-schema";
import { requireAuth, type User } from "$lib/server/utils/session-checker";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { z } from "zod";


export const leaveServer = command(
    z.object({
        serverId: z.string()
    }),
    async({ serverId }) => {
        const user: User = requireAuth();

        // Find membership
        const existingMember = await db.query.member.findFirst({
            where: (m, { eq, and }) =>
                and(eq(m.userId, user.id), eq(m.serverId, serverId))
        });

        if (!existingMember) throw error(404, "You are not a member of this server");
        
        // Admins cannot leave
        if (existingMember.role === "ADMIN") throw error(403, "Admins cannot leave the server");
        
        // Remove member
        await db
            .delete(member)
            .where(eq(member.memberId, existingMember.memberId));

    }
);