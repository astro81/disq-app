import { form } from '$app/server';
import z from 'zod';
import { requireAuth } from '$lib/server/utils/session-checker';
import { db } from '$lib/server/db';
import { message } from '$lib/server/db/chat-schema';
import { io as Client } from 'socket.io-client';

export const messageFileUploadRemote = form(
	z.object({
		messageFile: z.string({ message: "File is required!" }).min(1, "File is required!"),
		content: z.string().optional(),
		channelId: z.string().min(1, "Channel ID is required!"),
		serverId: z.string().min(1, "Server ID is required!"),
	}),
	async ({ messageFile, content, channelId, serverId }) => {
		// Check auth
		const user = requireAuth();
		if (!user) throw new Error("Unauthorized");

		// Check server membership
		const serverMember = await db.query.member.findFirst({
			where: (m, { and, eq }) => and(eq(m.serverId, serverId), eq(m.userId, user.id)),
		});

		if (!serverMember) throw new Error("Server not found or access denied");

		// Fetch channel info
		const serverChannel = await db.query.channel.findFirst({
			where: (c, { eq }) => eq(c.channelId, channelId)
		});

		if (!serverChannel) throw new Error("Channel not found");

		// Create message
		const newMessage = await db
			.insert(message)
			.values({
				messageContent: content || messageFile, // Default to file URL if no content
				messageFileUrl: messageFile,
				memberId: serverMember.memberId,
				channelId: serverChannel.channelId
			})
			.returning();

		if (newMessage[0]) {
			const socketURL = process.env.PUBLIC_SOCKET_URL || "http://localhost:3001";
			const socket = Client(socketURL, { transports: ["websocket"] });
			socket.emit("message", { roomId: serverChannel.channelId, message: newMessage[0] });
			socket.disconnect();
		}

		return { success: true, message: newMessage[0] };
	}
);