import { query } from "$app/server";
import { db } from "$lib/server/db";
import { conversation } from "$lib/server/db/chat-schema";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const findConversation = query(
    z.object({
        memberOneId: z.string(),
        memberTwoId: z.string(),
    }),
    async ({ memberOneId, memberTwoId }) => {
        const conv = await db.query.conversation.findFirst({
            where: and(
                eq(conversation?.memberOneId, memberOneId),
                eq(conversation?.memberTwoId, memberTwoId)
            )
        })

        if (!conv) throw new Error("No conversation found");

        //todo: also include members profile

        return conv
    }
);

