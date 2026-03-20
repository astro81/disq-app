const WS_SERVER = process.env.WS_SERVER_URL ?? 'http://localhost:3001';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? 'dev-secret';

export async function broadcastToClient(channelId: string, payload: object) {
	try {
		await fetch(`${WS_SERVER}/broadcast`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-internal-secret': INTERNAL_SECRET,
			},
			body: JSON.stringify({ channelId, payload }),
		});

		console.log("message broadcast", channelId, payload);
	} catch (err) {
		console.error('[broadcastToClient] Failed to reach WS server:', err);
	}
}