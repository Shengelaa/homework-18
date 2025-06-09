"use client";

import { useEffect, useState, FormEvent } from "react";
import Chat from "@/components/Chat";
import PublicChat from "@/components/PublicChat";
import Admin from "@/components/Admin";
import getSocket from "@/config/sockets";

export default function Home() {
  const [socket, setSocket] = useState<any>(null);

  const [publicEmail, setPublicEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showPublicChat, setShowPublicChat] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // ✅ Safe browser-only socket init
  useEffect(() => {
    const s = getSocket();
    setSocket(s);
  }, []);

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit("joinRoom", { roomId, userEmail });
    setShowChat(true);
  };

  const handlePublicJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket?.emit("JoinpublicRoom", { userEmail: publicEmail });
    setShowPublicChat(true);
  };

  const handleAdminPannel = () => {
    if (adminPass !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      alert("Invalid Admin Code");
      return;
    }
    setShowAdminPanel(true);
  };

  if (showAdminPanel) return <Admin />;
  if (showChat) return <Chat roomId={roomId} userEmail={userEmail} />;
  if (showPublicChat)
    return <PublicChat userEmail={publicEmail} roomId="public" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 p-8 flex flex-col items-center box-border">
      <div className="w-full max-w-3xl space-y-10 box-border">
        <h1 className="text-4xl font-extrabold text-center text-indigo-800 drop-shadow-lg mb-6">
          🌐 Real-Time Chat App
        </h1>

        {/* Public Chat Form */}
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
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 shadow-md transition"
            >
              Join Public Chat
            </button>
          </form>
        </section>

        {/* Private Chat Form */}
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
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full p-3 border border-purple-300 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md transition"
            >
              Join Chat Room
            </button>
          </form>
        </section>

        {/* Admin Panel */}
        <div className="flex justify-center mt-8 flex-row space-x-4">
          <input
            onChange={(e) => setAdminPass(e.target.value)}
            type="text"
            placeholder="Enter Admin Code"
            className="border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-400 bg-white text-red-700 placeholder-red-300 rounded-xl px-4 py-3 shadow-sm transition-all"
            value={adminPass}
          />
          <button
            onClick={handleAdminPannel}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition cursor-pointer"
          >
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}
