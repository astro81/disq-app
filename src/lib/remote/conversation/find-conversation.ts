import { db } from "$lib/server/db";
import { conversation } from "$lib/server/db/chat-schema";
import { and, eq } from "drizzle-orm";

export async function findConversationInternal(
    memberOneId: string,
    memberTwoId: string
) {
    return db.query.conversation.findFirst({
        where: and(
            eq(conversation.memberOneId, memberOneId),
            eq(conversation.memberTwoId, memberTwoId)
        )
    });
}