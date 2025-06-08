require("dotenv").config();

const mongoose = require("mongoose");

module.exports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected successfully!");
  } catch (e) {
    console.log("Couldnt connect to DB!!");
  }
};
