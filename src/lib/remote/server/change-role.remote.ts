import { command, getRequestEvent } from "$app/server";
import { db } from "$lib/server/db";
import { member, server } from "$lib/server/db/server-schema";
import { error, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { getServerMembers } from "./server.remote";


const requireAuth = () => {
    const { locals } = getRequestEvent();

    if (!locals.user || !locals.session) redirect(307, '/login');

    return locals.user;
}


export const changeMemberRole = command(
    z.object({ 
        serverId: z.string(),
        memberId: z.string(),
        role: z.enum(["ADMIN", "MODERATOR", "GUEST"])
    }), 
    async({ serverId, memberId, role }) => {
    try {

        const user = requireAuth();

        if (!serverId) throw error(400, "Server Id missing");
        if (!memberId) throw error(400, "Member Id not specified");
        if (!role) throw error(400, "Member role not defined");

        // Fetch current user's membership in the server
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
        
        // Only admins can change roles
        if (currentMember.role !== "ADMIN") throw error(403, "Only admins can change member roles");
        
        // Fetch the target member
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

        // Prevent changing your own role
        if (targetMember.userId === user.id) throw error(400, "You cannot change your own role");
        

        // Update role
        await db
            .update(member)
            .set({ role })
            .where(eq(member.memberId, memberId));

        getServerMembers({ serverId }).refresh();
        
    } catch (err) {
        console.log(`${serverId}`, err);
        throw error(500, "Internal Error");
    }
})