// socket.svelte.ts
export class SocketState {
    isConnected = $state(false);
}

export const socketState = new SocketState();
