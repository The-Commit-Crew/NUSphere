import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    let token = null;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookieStr) => {
        const [key, value] = cookieStr.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies.accessToken;
    }
    if (!token) {
      return next(new Error("Access denied. No token provided"));
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
      if (error) {
        return next(new Error("Invalid or expired token"));
      }
      socket.userId = user.userId;
      next();
    });
  });

  io.on("connection", (socket) => {
    socket.join(socket.userId.toString());
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not yet initialised");
  }
  return io;
};
