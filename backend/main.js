const http = require("http");
const express = require("express");
const connectToDb = require("./db/connectToDb");
const publicChatModel = require("./models/publicChat.model");
const privateMessageModel = require("./models/privateChat.model");
const {
  upload,
  deleteFromCloudinary,
} = require("./config/connectToCloudinary");
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

const isBase64Image = (str) => {
  return typeof str === "string" && str.startsWith("data:image/");
};

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ roomId, userEmail }) => {
    socket.join(roomId);
    try {
      const room = await privateMessageModel.findOne({ roomId });
      if (room) {
        socket.emit("roomMessages", { roomId, messages: room.messages });
      } else {
        socket.emit("roomMessages", { roomId, messages: [] });
      }
    } catch (err) {
      console.error("Error fetching room messages:", err);
      socket.emit("roomMessages", { roomId, messages: [] });
    }
    console.log(`${userEmail} Joined ${roomId}`);
  });

  socket.on("privateMessage", async ({ roomId, userEmail, msg }) => {
    let messageContent = msg;

    if (isBase64Image(msg)) {
      try {
        const result = await upload(msg, "privateMessages");
        messageContent = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return socket.emit("error", "Image upload failed");
      }
    }

    let existingRoom = await privateMessageModel.findOne({ roomId });
    if (existingRoom) {
      existingRoom.messages.push({ userEmail, msg: messageContent });
      await existingRoom.save();
    } else {
      const newMessage = new privateMessageModel({
        roomId,
        messages: [{ userEmail, msg: messageContent }],
      });
      await newMessage.save();
    }

    io.to(roomId).emit("privateMessage", {
      roomId,
      userEmail,
      msg: messageContent,
    });
  });

  socket.on("JoinpublicRoom", async ({ userEmail }) => {
    socket.join("publicRoom");
    const publicMessages = await publicChatModel.find();
    socket.emit("publicMessages", publicMessages);

    console.log(`${userEmail} Joined publicRoom`);
  });

  socket.on("publicMessage", async ({ userEmail, msg }) => {
    let messageContent = msg;

    if (isBase64Image(msg)) {
      try {
        const result = await upload(msg, "publicMessages");
        messageContent = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return socket.emit("error", "Image upload failed");
      }
    }

    const newMessage = new publicChatModel({ userEmail, msg: messageContent });
    await newMessage.save();
    io.to("publicRoom").emit("publicMessage", {
      userEmail,
      msg: messageContent,
    });
  });

  socket.on("deletePublicMessage", async ({ messageId }) => {
    try {
      // Find and delete the message
      const message = await publicChatModel.findById(messageId);
      if (
        message &&
        message.msg &&
        message.msg.startsWith("https://res.cloudinary.com")
      ) {
        const publicId = message.msg
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await deleteFromCloudinary(publicId);
      }
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

      const messageToDelete = room.messages.id(messageId);
      if (
        messageToDelete &&
        typeof messageToDelete.msg === "string" &&
        messageToDelete.msg.startsWith("https://res.cloudinary.com")
      ) {
        const publicId = messageToDelete.msg
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await deleteFromCloudinary(publicId);
      }

      room.messages = room.messages.filter(
        (message) => message._id.toString() !== messageId
      );

      await room.save();

      io.to(roomId).emit("privateMessagesUpdated", {
        roomId,
        messages: room.messages,
      });

      io.emit("privateRoomsUpdated");
    } catch (err) {
      console.error("Error deleting private message:", err);
      socket.emit("error", "Failed to delete private message");
    }
  });

  socket.on("deletePrivateRoom", async ({ roomId }) => {
    try {
      // Optionally, delete all images in this room from Cloudinary
      const room = await privateMessageModel.findOne({ roomId });
      if (room) {
        for (const message of room.messages) {
          if (
            typeof message.msg === "string" &&
            message.msg.startsWith("https://res.cloudinary.com")
          ) {
            const publicId = message.msg
              .split("/")
              .slice(-2)
              .join("/")
              .split(".")[0];
            await deleteFromCloudinary(publicId);
          }
        }
      }
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
