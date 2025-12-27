import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { member, server } from "$lib/server/db/server-schema";
import { error, redirect } from "@sveltejs/kit";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";
import { getServerMembers } from "./server.remote";


const requireAuth = () => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.session) redirect(307, '/login');

    return locals.user;
}


export const kickServerMember = command(
    z.object({ 
        serverId: z.string(),
        memberId: z.string(),
    }), 
    async({ serverId, memberId }) => {
    try {

        const user = requireAuth();

        if (!serverId) throw error(400, "Server Id missing");
        if (!memberId) throw error(400, "Member Id not specified");

        // Current user's membership
        const [currentMember] = await db
            .select()
            .from(member)
            .where(
                and(
                    eq(member.serverId, serverId),
                    eq(member.userId, user.id)
                )
            );

        if (!currentMember) throw error(403, "You are not a member of this server");

        if (!["ADMIN", "MODERATOR"].includes(currentMember.role)) throw error(403, "You do not have permission to kick members");
        
        // Target member
        const [targetMember] = await db
            .select()
            .from(member)
            .where(
                and(
                    eq(member.serverId, serverId),
                    eq(member.memberId, memberId)
                )
            );

        if (!targetMember) throw error(404, "Member not found");
        

        // Cannot kick yourself
        if (targetMember.userId === user.id) throw error(400, "You cannot kick yourself");
        

        // Moderators cannot kick admins
        if (currentMember.role === "MODERATOR" && targetMember.role === "ADMIN") throw error(403, "Moderators cannot kick admins");
        

        // Prevent removing last admin
        if (targetMember.role === "ADMIN") {
            const [{ count }] = await db
                .select({ count: sql<number>`count(*)` })
                .from(member)
                .where(
                    and(
                        eq(member.serverId, serverId),
                        eq(member.role, "ADMIN")
                    )
                );
            
            if (count <= 1) throw error(400, "Server must have at least one admin");
        }

        
        // Kick (delete member)
        await db
            .delete(member)
            .where(
                and(
                    eq(member.memberId, memberId),
                    eq(member.serverId, serverId)
                )
            );



        getServerMembers({ serverId }).refresh();
        
    } catch (err) {
        console.log(`${serverId}`, err);
        throw error(500, "Internal Error");
    }
})