import { query } from "$app/server";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/auth-schema";
import { member } from "$lib/server/db/server-schema";
import z from "zod";
import { and, eq } from "drizzle-orm";


export const getServerMembersList = query(z.object({ serverId: z.string() }), async ({ serverId }) => {
    return await db
        .select({
            memberId: member.memberId,
            role: member.role,
            userId: user.id,
            serverId: member.serverId,
            username: user.name, 
            userProfileImage: user.image,
            userDisplayName: user.displayName,
            userEmail: user.email,
            joinedAt: member.createdAt,
            updatedAt: member.updatedAt
        })
        .from(member)
        .leftJoin(user, eq(member.userId, user.id))
        .where(eq(member.serverId, serverId))
        .orderBy(member.role);

});


export const getCurrentServerUserMember = query(
    z.object({ 
        serverId: z.string(),  
        userId: z.string()
    }), 
    async ({ serverId, userId }) => {
        const currentMember = await db.query.member.findFirst({
            columns: {
                memberId: true,
                role: true,
                serverId: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
            },
            where: and(
                eq(member.serverId, serverId),
                eq(member.userId, userId)
            )
        });

        if (!currentMember) throw new Error('Member not found!');

        return currentMember;
    }
);