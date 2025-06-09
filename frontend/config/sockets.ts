import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export default function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (!socket) {
    socket = io("https://homework-18-production-8b06.up.railway.app/"); // your actual backend URL
  }
  return socket;
}
