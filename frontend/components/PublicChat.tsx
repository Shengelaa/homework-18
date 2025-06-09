"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import getSocket from "@/config/sockets";
import "../app/globals.css";

type PropType = {
  userEmail: string;
  roomId: string;
};

type MessageType = {
  userEmail: string;
  msg: string;
  timestamp?: string;
};

export default function PublicChat({ userEmail }: PropType) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [msg, setMsg] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = getSocket();
      setSocket(s);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("JoinpublicRoom", { userEmail });

    const handlePublicMsg = (data: MessageType) => {
      setMessages((prev) => [...prev, data]);
    };

    const handlePublicMsgs = (data: MessageType[]) => {
      setMessages(data);
    };

    socket.on("publicMessage", handlePublicMsg);
    socket.on("publicMessages", handlePublicMsgs);

    return () => {
      socket.off("publicMessage", handlePublicMsg);
      socket.off("publicMessages", handlePublicMsgs);
    };
  }, [socket, userEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendPublicMsg = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!msg.trim() || !socket) return;

    const newMsg: MessageType = {
      userEmail,
      msg,
      timestamp: new Date().toISOString(),
    };

    socket.emit("publicMessage", newMsg);
    setMsg("");
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-green-200 to-emerald-300 items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-4 flex flex-col h-full">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-3xl font-extrabold text-green-800">
            🌐 Public Chat
          </h1>
          <button
            className="text-sm text-green-600 hover:text-green-800 font-semibold"
            onClick={() => {
              if (typeof window !== "undefined") window.location.reload();
            }}
          >
            Leave
          </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-3 px-2 py-2 bg-gray-50 rounded-lg border border-gray-300">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center mt-20 select-none">
              No messages yet. Say hi!
            </p>
          ) : (
            messages.map((el, i) => {
              const isOwn = el.userEmail === userEmail;
              return (
                <div
                  key={i}
                  className={`max-w-md px-4 py-2 rounded-xl animate-fadeIn ${
                    isOwn
                      ? "bg-green-200 ml-auto text-right"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  <p className="text-gray-800 break-words">{el.msg}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-1 select-none">
                    <span>{isOwn ? "You" : el.userEmail}</span>
                    <time>{formatTime(el.timestamp)}</time>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendPublicMsg}
          className="mt-4 flex flex-col sm:flex-row gap-3 w-full"
        >
          <input
            type="text"
            placeholder="Write your message..."
            className="w-full sm:flex-1 rounded-full border border-green-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-full shadow transition"
          >
            Send
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out both;
        }
      `}</style>
    </div>
  );
}
