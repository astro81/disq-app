import { command, form, query } from "$app/server";
import { db } from "$lib/server/db";
import { conversation } from "$lib/server/db/chat-schema";
import z from "zod";
import { findConversation } from "./conversation.remote";
import { and, eq } from "drizzle-orm";
import { findConversationInternal } from "./find-conversation";

export const createNewConversation = form( 
    z.object({
        memberOneId: z.string(),
        memberTwoId: z.string(),
    }),
    async ({ memberOneId, memberTwoId }) => {

        try {
            const conv = await db.insert(conversation).values({
                memberOneId,
                memberTwoId
            }).returning({ conversationId: conversation.conversationId })

            return conv

        } catch (error) {
            console.log("Failed to create conversation", error);
            return null
        }

    }
);



export const getOrCreateConversation = query( 
    z.object({
        memberOneId: z.string(),
        memberTwoId: z.string(),
    }),
    async ({ memberOneId, memberTwoId }) => {

        let conv =
            await findConversationInternal(memberOneId, memberTwoId) ??
            await findConversationInternal(memberTwoId, memberOneId);

        if (!conv) {
            const [created] = await db
                .insert(conversation)
                .values({ memberOneId, memberTwoId })
                .returning();

            conv = created;
        }

        return conv;
    }
)