import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { registerSocketHandlers } from "./game/socketHandler";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
