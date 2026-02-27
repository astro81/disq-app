import { io, type Socket } from "socket.io-client";
import { PUBLIC_SOCKET_URL } from '$env/static/public';

class SocketState {
	socket = $state<Socket | null>(null);
	isConnected = $state(false);

	connect() {
		if (this.socket) return;

		const socket = io(PUBLIC_SOCKET_URL, {
			transports: ["websocket"]
		});

		socket.on("connect", () => {
			this.isConnected = true;
		});

		socket.on("disconnect", () => {
			this.isConnected = false;
		});

		this.socket = socket;
	}

	disconnect() {
		this.socket?.disconnect();
		this.socket = null;
		this.isConnected = false;
	}
}

export const socketState = new SocketState();