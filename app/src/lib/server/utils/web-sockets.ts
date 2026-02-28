import type { ServerWebSocket } from 'bun';


interface WSData {
	connectionId: string;
	channelId: string;
}

export const connectedClients = new Set<ServerWebSocket<WSData>>();

export function broadcastToClient(channelId: string, payload: object) {
	const message = JSON.stringify(payload);

	for (const client of connectedClients) {
		if (client.data.channelId === channelId) {
			client.send(message);
		}
	}
}