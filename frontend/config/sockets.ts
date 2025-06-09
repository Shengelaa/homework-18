import { io } from "socket.io-client";

const socket = io("http://localhost:4000");
// const socket = io("https://homework-18-egxs.onrender.com");

export default socket;
