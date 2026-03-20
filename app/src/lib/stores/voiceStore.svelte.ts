import { io, type Socket } from 'socket.io-client';
import { env } from '$env/dynamic/public';
import Peer from 'simple-peer';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export class VoiceState {
    status = $state<ConnectionStatus>('idle');
    isMuted = $state(false);
    error = $state<string | null>(null);
    currentRoomId = $state<string | null>(null);

    // We store peers and streams by socket ID
    peers = $state<Map<string, Peer.Instance>>(new Map());
    remoteStreams = $state<Map<string, MediaStream>>(new Map());
    localStream = $state<MediaStream | null>(null);

    private socket: Socket | null = null;

    private getSocket(): Socket {
        if (this.socket) return this.socket;

        const socketUrl = env.PUBLIC_SOCKET_URL || 'http://localhost:3001';
        this.socket = io(socketUrl, {
            autoConnect: false
        });

        // --- Socket event handlers ---

        this.socket.on('all-users', (users: string[]) => {
            if (!this.localStream) return;
            users.forEach((userId) => {
                this.createPeer(userId, true);
            });
        });

        this.socket.on('user-joined', (userId: string) => {
            if (!this.localStream) return;
            this.createPeer(userId, false);
        });

        this.socket.on('user-left', (userId: string) => {
            this.removePeer(userId);
        });

        this.socket.on('signal', ({ from, signal }: { from: string; signal: Peer.SignalData }) => {
            const peer = this.peers.get(from);
            if (peer && !peer.destroyed) {
                peer.signal(signal);
            }
        });

        this.socket.on('connect', () => {
            if (this.status === 'connecting') {
                this.status = 'connected';
            }
        });

        this.socket.on('disconnect', () => {
            // Only set to error if we didn't intentionally leave
            if (this.status === 'connected') {
                this.status = 'error';
                this.error = 'Connection lost. Please rejoin.';
                this.cleanupCall();
            }
        });

        this.socket.on('connect_error', () => {
            this.status = 'error';
            this.error = 'Failed to connect to voice server.';
        });

        return this.socket;
    }

    private createPeer(userId: string, initiator: boolean) {
        if (!this.localStream || !this.socket) return;

        // Don't create duplicate peers
        if (this.peers.has(userId)) return;

        const peer = new Peer({
            initiator,
            trickle: true,
            stream: this.localStream
        });

        peer.on('signal', (signal) => {
            this.socket?.emit('signal', { to: userId, signal });
        });

        peer.on('stream', (remoteStream) => {
            const newStreams = new Map(this.remoteStreams);
            newStreams.set(userId, remoteStream);
            this.remoteStreams = newStreams;
        });

        peer.on('error', (err) => {
            console.error(`Peer error with ${userId}:`, err);
            this.removePeer(userId);
        });

        peer.on('close', () => {
            this.removePeer(userId);
        });

        const newPeers = new Map(this.peers);
        newPeers.set(userId, peer);
        this.peers = newPeers;
    }

    private removePeer(userId: string) {
        const peer = this.peers.get(userId);
        if (peer && !peer.destroyed) {
            peer.destroy();
        }

        const newPeers = new Map(this.peers);
        const newStreams = new Map(this.remoteStreams);
        newPeers.delete(userId);
        newStreams.delete(userId);
        this.peers = newPeers;
        this.remoteStreams = newStreams;
    }

    private cleanupCall() {
        // Destroy all peers
        this.peers.forEach((peer) => {
            if (!peer.destroyed) peer.destroy();
        });
        this.peers = new Map();
        this.remoteStreams = new Map();

        // Stop local audio tracks
        this.localStream?.getTracks().forEach((track) => track.stop());
        this.localStream = null;
    }

    async joinVoice(roomId: string) {
        if (this.status === 'connected' || this.status === 'connecting') return;

        this.status = 'connecting';
        this.error = null;
        this.currentRoomId = roomId;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });

            this.localStream = stream;
            this.isMuted = false;

            const socket = this.getSocket();
            socket.connect();
            socket.emit('join-voice', roomId);

            this.status = 'connected';
        } catch (err: unknown) {
            this.status = 'error';
            if (err instanceof DOMException && err.name === 'NotAllowedError') {
                this.error = 'Microphone access denied. Please allow microphone access and try again.';
            } else if (err instanceof DOMException && err.name === 'NotFoundError') {
                this.error = 'No microphone found. Please connect a microphone and try again.';
            } else {
                this.error = 'Failed to access microphone. Please check your settings.';
            }
            console.error('Failed to join voice:', err);
        }
    }

    leaveVoice() {
        if (this.currentRoomId && this.socket) {
            this.socket.emit('leave-voice', this.currentRoomId);
        }

        this.cleanupCall();

        this.socket?.disconnect();
        this.socket = null;

        this.status = 'idle';
        this.error = null;
        this.isMuted = false;
        this.currentRoomId = null;
    }

    toggleMute() {
        if (!this.localStream) return;

        const newMuted = !this.isMuted;
        this.localStream.getAudioTracks().forEach((track) => {
            track.enabled = !newMuted;
        });
        this.isMuted = newMuted;
    }

    get peerCount(): number {
        return this.remoteStreams.size;
    }
}

export const voiceState = new VoiceState();
