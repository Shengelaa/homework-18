const { default: mongoose } = require("mongoose");

const rating = new mongoose.Schema({
  ratings: [
    {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  ],
});

module.exports = mongoose.model("Ratings", rating);
