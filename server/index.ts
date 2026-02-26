import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);

export const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    socket.emit("status", "connected");

    socket.on("join", (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined ${roomId}`);
    });

    socket.on("message", ({ roomId, message }) => {
        io.to(roomId).emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);
    });
});

app.get("/", (_, res) => {
    res.send("Socket.IO server running");
});

httpServer.listen(3001, () => {
    console.log("🚀 http://localhost:3001");
});