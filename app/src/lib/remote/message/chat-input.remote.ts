// chat-input.remote.ts
import { form } from '$app/server';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { message } from '$lib/server/db/chat-schema';
import { requireAuth } from '$lib/server/utils/session-checker';
import { error } from '@sveltejs/kit';
import { broadcastToClient } from '$lib/server/utils/web-sockets';

export const chatInputSend = form(
	z.object({
		content: z.string().min(1, 'Message cannot be empty'),
		channelId: z.string().min(1),
		serverId: z.string().min(1),
		codeLanguage: z.string().optional(),
		codeTheme: z.string().optional()
	}),
	async ({ content, channelId, serverId, codeLanguage, codeTheme }) => {
		try {

			// Check Auth
			const user = requireAuth();
			if (!user) error(401, 'Unauthorized');


			// Check server membership to get memberId
			const serverMember = await db.query.member.findFirst({
				where: (m, { and, eq }) => and(eq(m.serverId, serverId), eq(m.userId, user.id))
			});

			if (!serverMember) error(401, 'Access denied: Not a member of this server');

			// Encode code snippets with prefix
			let finalContent = content;
			if (codeLanguage && codeLanguage.trim()) {
				finalContent = `:::code:::${JSON.stringify({ lang: codeLanguage, theme: codeTheme || 'github-dark', code: content })}`;
			}

			// Create message in DB
			const [newMessage] = await db
				.insert(message)
				.values({
					messageContent: finalContent,
					messageFileUrl: '', 										// Handle files separately or add to schema if needed
					memberId: serverMember.memberId,
					channelId: channelId
				})
				.returning();

			const messagePayload = {
				messageContent: finalContent,
				messageFileUrl: '',
				memberId: serverMember.memberId,
				channelId: channelId,
				messageDeleted: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				member: {
					memberId: serverMember.memberId,
					role: serverMember.role,
					user: {
						id: user.id,
						name: user.name,
						image: user.image,
						displayName: user.displayName,
					}
				}
			}

			broadcastToClient(channelId, messagePayload);

			return { success: true, message: newMessage };
		} catch (error: any) {
			console.error('REMOTE_CHAT_INPUT_ERROR:', error);
			return { success: false, error: error.message || 'Internal error' };
		}
	}
);