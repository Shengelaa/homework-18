const { default: mongoose } = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },
    msg: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

const privateRoomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [messageSchema],
});

module.exports = mongoose.model("privateChat", privateRoomSchema);
