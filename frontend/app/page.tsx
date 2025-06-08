"use client";

import Chat from "@/components/Chat";
import PublicChat from "@/components/PublicChat";
import socket from "@/config/sockets";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [publicEmail, setPublicEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [showChat, setShowChat] = useState(false);
  const [showPublicChat, setShowPublicChat] = useState(false);

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("joinRoom", { roomId, userEmail });
    setShowChat(true);
  };

  const handlePublicJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("JoinpublicRoom", { userEmail: publicEmail });
    setShowPublicChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 p-8 flex flex-col items-center">
      {showChat ? (
        <Chat roomId={roomId} userEmail={userEmail} />
      ) : showPublicChat ? (
        <PublicChat userEmail={publicEmail} roomId="public" />
      ) : (
        <div className="w-full max-w-3xl space-y-10">
          <h1 className="text-4xl font-extrabold text-center text-indigo-800 drop-shadow-lg mb-6">
            🌐 Real-Time Chat App
          </h1>

          <section className="bg-white p-8 rounded-2xl shadow-xl ring-1 ring-green-200 hover:ring-green-300 transition">
            <h2 className="text-2xl font-semibold mb-6 text-green-700 border-b border-green-100 pb-2">
              Public Chat
            </h2>
            <form onSubmit={handlePublicJoin} className="space-y-4">
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 border border-green-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-green-300 transition"
                value={publicEmail}
                onChange={(e) => setPublicEmail(e.target.value)}
                required
                aria-label="Public chat email input"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 shadow-md transition cursor-pointer"
              >
                Join Public Chat
              </button>
            </form>
          </section>

          <section className="bg-white p-8 rounded-2xl shadow-xl ring-1 ring-purple-300 hover:ring-purple-400 transition">
            <h2 className="text-2xl font-semibold mb-6 text-purple-700 border-b border-purple-200 pb-2">
              Join a Room
            </h2>
            <form onSubmit={handleJoinRoom} className="space-y-6">
              <input
                type="number"
                placeholder="Room ID"
                className="w-full p-3 border border-purple-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                aria-label="Room ID input"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 border border-purple-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                aria-label="User email input"
              />
              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md transition cursor-pointer"
              >
                Join Chat Room
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
