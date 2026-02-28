import { query, command } from "$app/server";
import { db } from "$lib/server/db";
import { message } from "$lib/server/db/chat-schema";
import { user } from "$lib/server/db/auth-schema";
import { member } from "$lib/server/db/server-schema";
import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "$lib/server/utils/session-checker";
import { broadcastToClient } from "$lib/server/utils/web-sockets";

export const getMessages = query(
    z.object({
        channelId: z.string().min(1),
    }),
    async ({ channelId }) => {
        const results = await db.query.message.findMany({
            where: eq(message.channelId, channelId),
            with: {
                member: {
                    with: {
                        user: {
                            columns: {
                                id: true,
                                name: true,
                                image: true,
                                displayName: true,
                            }
                        }
                    }
                }
            },
            orderBy: desc(message.createdAt),
            limit: 50,
        });

        return results.reverse();
    }
);

export const deleteMessage = command(
    z.object({
        messageId: z.string().min(1),
        channelId: z.string().min(1),
    }),
    async ({ messageId, channelId }) => {
        const currentUser = requireAuth();
        if (!currentUser) throw new Error("Unauthorized");

        // Find the message and check ownership
        const msg = await db.query.message.findFirst({
            where: eq(message.messageId, messageId),
            with: {
                member: true
            }
        });

        if (!msg) throw new Error("Message not found");
        if (msg.member.userId !== currentUser.id) throw new Error("Forbidden: You can only delete your own messages");

        const [updatedMessage] = await db
            .update(message)
            .set({ messageDeleted: true, updatedAt: new Date() })
            .where(eq(message.messageId, messageId))
            .returning();

        broadcastToClient(channelId, {
            type: 'MESSAGE_DELETE',
            messageId: messageId,
            channelId: channelId
        });

        return { success: true, message: updatedMessage };
    }
);
