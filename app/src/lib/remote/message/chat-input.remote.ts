import { form } from '$app/server';
import z from 'zod';

export const chatInputSend = form(
	z.object({
		content: z.string().min(1),
		channelId: z.string().min(1),
		serverId: z.string().min(1),
	}),
	async ({ content, channelId, serverId }) => {
		console.log("content", content);
		console.log("channelId", channelId);
		console.log("serverId", serverId);
	}
)