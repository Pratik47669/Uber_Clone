const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;
function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
socket.on("join", async ({ userId, role }) => {
  if (role === "user") {
    await userModel.findByIdAndUpdate(userId, {
      socketId: socket.id
    });
  }

  if (role === "captain") {
    await captainModel.findByIdAndUpdate(userId, {
      socketId: socket.id
    });
  }

socket.join(userId); 
    console.log(`User ${userId} joined room ${userId}`);

    console.log("JOIN:", userId, role);
});

    socket.on("update-location-captain", async (data) => {
      console.log("📥 Location received:", data);

      const { userId, location } = data;

      if (!location || !location.lat || !location.lng) return;

      await captainModel.findByIdAndUpdate(userId, {
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
      });

      console.log("✅ Location saved in DB");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

function sendMessageToSocketId(roomId, messageObject)  {
    console.log(`sending message to room ${roomId}`, messageObject);

    if (io) {
        io.to(roomId).emit(messageObject.event, messageObject.data);
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };