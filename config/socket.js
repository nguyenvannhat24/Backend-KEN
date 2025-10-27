const { Server } = require("socket.io");

let io;
const userSockets = new Map(); // lưu { userId: socket.id }

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // FE của bạn
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Khi FE gửi user_id để đăng ký
    socket.on("register-user", (userId) => {
      userSockets.set(userId, socket.id);
    });

    socket.on("disconnect", () => {
      for (const [userId, id] of userSockets.entries()) {
        if (id === socket.id) {
          userSockets.delete(userId);
        }
      }
    });
  });
}

function sendNotification(event, data, userId = null) {
  if (!io) return;
  if (userId) {
    const socketId = userSockets.get(userId);
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  } else {
    io.emit(event, data);
  }
}

module.exports = { initSocket, sendNotification };
