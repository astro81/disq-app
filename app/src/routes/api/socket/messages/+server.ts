import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { requireAuth, type User } from '$lib/server/utils/session-checker.ts';
import { db } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { member, channel } from '$lib/server/db/server-schema';
import { message } from '$lib/server/db/chat-schema.ts';
import { io as Client } from 'socket.io-client';


const messageSchema = z.object({
	content: z.string().min(1, 'Message cannot be empty')
});

export const POST: RequestHandler = async ({ request, url }) => {
	try {
		const formData = await request.formData();
		const content = formData.get('content')?.toString() || '';
		const fileUrl = formData.get('fileUrl')?.toString() || '';

		const channelId = url.searchParams.get('channelId');
		const serverId = url.searchParams.get('serverId');

		// Validate IDs
		if (!channelId) return json({ error: 'Missing channelId' }, { status: 400 });
		if (!serverId) return json({ error: 'Missing serverId' }, { status: 400 });

		// Check auth
		const user: User = requireAuth();
		if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

		// Validate content
		const parsed = messageSchema.safeParse({ content });
		if (!parsed.success)
			return json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

		// Check server membership
		const serverMember = await db.query.member.findFirst({
			where: (m, { and, eq }) => and(eq(m.serverId, serverId), eq(m.userId, user.id)),
			with: {
				user: true,
				server: true
			}
		});

		if (!serverMember) return json({ error: 'Server not found or access denied' }, { status: 404 });

		// Fetch channel info
		const serverChannel = await db.query.channel.findFirst({
			where: (c, { eq }) => eq(c.channelId, channelId)
		});

		if (!serverChannel) return json({ error: 'Channel not found' }, { status: 404 });

		// Create message
		const newMessage = await db
			.insert(message)
			.values({
				messageContent: parsed.data.content,
				messageFileUrl: fileUrl, // empty string if none
				memberId: serverMember.memberId,
				channelId: serverChannel.channelId
			})
			.returning();

		console.log("message api", newMessage);

		// const channelKey = `chat:${serverChannel.channelId}:messages`;
		// response.scoket.server.io.emit(channelKey, newMessage);

		const socket = Client("http://localhost:3001", { transports: ["websocket"] });
		socket.emit("message", { roomId: serverChannel.channelId, message: newMessage[0] });
		// io.to(serverChannel.channelId).emit(channelKey, newMessage[0]);
		socket.disconnect();

		// connect on frontend
		// socket.on('message', (msg) => {
		// 	chatMessages.push(msg);
		// });

		return json({ success: true, message: newMessage[0] });
	} catch (error) {
		console.error('MESSAGE_POST_ERROR:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
