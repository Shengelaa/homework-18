"use client";

import socket from "@/config/sockets";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import "../app/globals.css";

type PropType = {
  roomId: string;
  userEmail: string;
};

type MessageType = PropType & {
  msg: string;
  timestamp?: string;
};

export default function Chat({ roomId, userEmail }: PropType) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listenerAttached = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendPrivateMsg = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!msg.trim()) return;
    const newMsg = {
      roomId,
      userEmail,
      msg,
      timestamp: new Date().toISOString(),
    };
    socket.emit("privateMessage", newMsg);
    setMsg("");
  };

  useEffect(() => {
    socket.emit("joinRoom", { roomId, userEmail });

    if (listenerAttached.current) return;

    socket.on("privateMessage", (data: MessageType) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on(
      "roomMessages",
      ({ messages: initialMessages }: { messages: MessageType[] }) => {
        setMessages(initialMessages || []);
      }
    );

    listenerAttached.current = true;

    return () => {
      socket.off("privateMessage");
      socket.off("roomMessages");
      listenerAttached.current = false;
    };
  }, []);

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-purple-200 to-indigo-300 p-2 sm:p-4">
      <div className="w-full max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-4 flex flex-col h-full">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-3xl font-extrabold text-purple-800">
            💬 Room: {roomId}
          </h1>
          <button
            className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
            onClick={() => window.location.reload()}
          >
            Leave Room
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
                      ? "bg-purple-200 ml-auto text-right"
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
          onSubmit={handleSendPrivateMsg}
          className="mt-4 flex flex-col sm:flex-row gap-3 w-full"
        >
          <input
            type="text"
            placeholder="Write your message..."
            className="w-full sm:flex-1 rounded-full border border-purple-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            required
            autoComplete="off"
          />

          <button
            type="submit"
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-full shadow transition"
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
