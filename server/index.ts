import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: process.env.PUBLIC_APP_URL,
        methods: ["GET", "POST"]
    }
});

// Track which voice room each socket is in
const socketVoiceRooms = new Map<string, string>();

io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.emit("status", "connected");

    socket.on("join", (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined ${roomId}`);
    });

    socket.on("message", ({ roomId, message }) => {
        io.to(roomId).emit("message", message);
    });

    // Voice Call Events
    socket.on("join-voice", (roomId: string) => {
        // Leave any previous voice room first
        const previousRoom = socketVoiceRooms.get(socket.id);
        if (previousRoom) {
            socket.leave(previousRoom);
            socket.to(previousRoom).emit("user-left", socket.id);
            console.log(`Socket ${socket.id} auto-left voice channel ${previousRoom}`);
        }

        socket.join(roomId);
        socketVoiceRooms.set(socket.id, roomId);
        console.log(`Socket ${socket.id} joined voice channel ${roomId}`);

        // Get all sockets in the room except the sender
        const existingUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
            .filter(id => id !== socket.id);

        // Send existing users to the joining user
        socket.emit("all-users", existingUsers);

        // Notify others in the room that a new peer joined
        socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("signal", ({ to, signal }: { to: string; signal: any }) => {
        io.to(to).emit("signal", { from: socket.id, signal });
    });

    socket.on("leave-voice", (roomId: string) => {
        socket.leave(roomId);
        socketVoiceRooms.delete(socket.id);
        console.log(`Socket ${socket.id} left voice channel ${roomId}`);
        socket.to(roomId).emit("user-left", socket.id);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);

        // Notify voice room peers when a socket disconnects unexpectedly
        const voiceRoom = socketVoiceRooms.get(socket.id);
        if (voiceRoom) {
            socket.to(voiceRoom).emit("user-left", socket.id);
            socketVoiceRooms.delete(socket.id);
            console.log(`Socket ${socket.id} removed from voice channel ${voiceRoom} on disconnect`);
        }
    });
});

app.get("/", (_, res) => {
    res.send("Socket.IO server running");
});

httpServer.listen(3001, () => {
    console.log(process.env.PUBLIC_SOCKET_URL);
});