const { default: mongoose } = require("mongoose");

const PublicMessage = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  msg: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("publicChat", PublicMessage);
