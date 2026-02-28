// chat-input.remote.ts
import { form } from '$app/server';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { message } from '$lib/server/db/chat-schema';
import { requireAuth } from '$lib/server/utils/session-checker';
import { error } from '@sveltejs/kit';

export const chatInputSend = form(
	z.object({
		content: z.string().min(1, 'Message cannot be empty'),
		channelId: z.string().min(1),
		serverId: z.string().min(1)
	}),
	async ({ content, channelId, serverId }) => {
		try {

			// Check Auth
			const user = requireAuth();
			if (!user) error(401, 'Unauthorized');


			// Check server membership to get memberId
			const serverMember = await db.query.member.findFirst({
				where: (m, { and, eq }) => and(eq(m.serverId, serverId), eq(m.userId, user.id))
			});

			if (!serverMember) error(401, 'Access denied: Not a member of this server');

			// Create message in DB
			const [newMessage] = await db
				.insert(message)
				.values({
					messageContent: content,
					messageFileUrl: '', 										// Handle files separately or add to schema if needed
					memberId: serverMember.memberId,
					channelId: channelId
				})
				.returning();

			return { success: true, message: newMessage };
		} catch (error) {
			console.error('REMOTE_CHAT_INPUT_ERROR:', error);
			return { success: false, error: error.message || 'Internal error' };
		}
	}
);