import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const getSocket = () => {
  if (!socket && typeof window !== "undefined") {
    socket = io("https://homework-18-production-8b06.up.railway.app/");
  }
  return socket;
};

export default getSocket;
