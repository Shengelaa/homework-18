import { io } from "socket.io-client";

const socket = io("https://homework-18-production.up.railway.app/");

export default socket;
