const http = require("http");
const express = require("express");
const connectToDb = require("./db/connectToDb");
const publicChatModel = require("./models/publicChat.model");
const privateMessageModel = require("./models/privateChat.model");

const { Server } = require("socket.io");
const app = express();
connectToDb();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ roomId, userEmail }) => {
    socket.join(roomId);
    const roomMessages = await privateMessageModel
      .findOne({ roomId })
      .then((room) => {
        if (room) {
          socket.emit("roomMessages", { roomId, messages: room.messages });
        } else {
          socket.emit("roomMessages", { roomId, messages: [] });
        }
      })
      .catch((err) => {
        console.error("Error fetching room messages:", err);
        socket.emit("roomMessages", { roomId, messages: [] });
      });

    console.log(`${userEmail} Joined ${roomId}`);
  });

  socket.on("privateMessage", async ({ roomId, userEmail, msg }) => {
    const existingRoom = await privateMessageModel.findOne({ roomId });
    if (existingRoom) {
      existingRoom.messages.push({ userEmail, msg });
      existingRoom.save();
    } else if (!existingRoom) {
      const newMessage = new privateMessageModel({
        roomId,
        messages: [{ userEmail, msg }],
      });

      newMessage.save();
    }

    io.to(roomId).emit("privateMessage", { roomId, userEmail, msg });
  });

  socket.on("JoinpublicRoom", async ({ userEmail }) => {
    socket.join("publicRoom");
    const publicMessages = await publicChatModel.find();
    socket.emit("publicMessages", publicMessages);

    console.log(`${userEmail} Joined publicRoom`);
  });

  socket.on("publicMessage", ({ userEmail, msg }) => {
    const newMessage = new publicChatModel({ userEmail, msg });
    newMessage.save();
    io.to("publicRoom").emit("publicMessage", { userEmail, msg });
  });

  socket.on("deletePublicMessage", async ({ messageId }) => {
    try {
      await publicChatModel.findByIdAndDelete(messageId);
      const publicMessages = await publicChatModel.find();
      io.emit("publicMessagesUpdated", publicMessages);
    } catch (error) {
      console.error("Error deleting public message:", error);
    }
  });
  socket.on("adminPannel", async () => {
    const publicMessages = await publicChatModel.find();
    const privateMessages = await privateMessageModel.find();

    console.log("Admin panel data:", { publicMessages, privateMessages });

    socket.emit("adminPannel", { publicMessages, privateMessages });
  });

  socket.on("deletePrivateMessage", async ({ roomId, messageId }) => {
    try {
      const room = await privateMessageModel.findOne({ roomId });
      if (!room) {
        return socket.emit("error", "Room not found");
      }

      room.messages = room.messages.filter(
        (message) => message._id !== messageId
      );

      await room.save();

      io.to(roomId).emit("privateMessagesUpdated", room.messages);

      io.emit("privateRoomsUpdated");
    } catch (err) {
      console.error("Error deleting private message:", err);
      socket.emit("error", "Failed to delete private message");
    }
  });

  socket.on("deletePrivateRoom", async ({ roomId }) => {
    try {
      await privateMessageModel.deleteOne({ roomId });
      io.emit("privateRoomsUpdated");
    } catch (error) {
      console.error("Error deleting private room:", error);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
