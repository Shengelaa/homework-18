const { default: mongoose } = require("mongoose");

const globalSmsCounter = new mongoose.Schema({
  globalSmsCount: {
    number: {
      type: Number,
      required: true,
      default: 0,
    },
  },
});

module.exports = mongoose.model("globalSmsCounter", globalSmsCounter);
