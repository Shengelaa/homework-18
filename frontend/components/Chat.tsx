import socket from "@/config/sockets";
import React, { FormEvent, useEffect, useRef, useState } from "react";

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
  const listenerAttached = useRef(false); // <-- Add this ref

  // Scroll to bottom when messages update
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
    if (listenerAttached.current) return; 

    socket.on("privateMessage", (data: MessageType) => {
      setMessages((prev) => [...prev, data]);
    });

    listenerAttached.current = true;

    return () => {
      socket.off("privateMessage");
      listenerAttached.current = false;
    };
  }, []);

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen w-full  bg-gradient-to-br from-purple-200 to-indigo-300 flex flex-col items-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-6 flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-purple-800 flex items-center gap-2">
            💬 Room: {roomId}
          </h1>
          <button
            className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
            onClick={() => window.location.reload()}
            aria-label="Leave room"
          >
            Leave Room
          </button>
        </header>

      
        <div
          className="flex-1 overflow-y-auto space-y-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100"
          style={{ maxHeight: "400px" }}
        >
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
                  className={`max-w-md px-4 py-2 rounded-xl relative animate-fadeIn
                    ${
                      isOwn
                        ? "bg-purple-200 ml-auto text-right"
                        : "bg-white border border-gray-300"
                    }`}
                  style={{ animationDuration: "0.3s" }}
                >
                  <p className="text-gray-800">{el.msg}</p>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-500 select-none">
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
          className="mt-6 flex gap-3 items-center"
          aria-label="Send message"
        >
          <input
            type="text"
            placeholder="Write your message..."
            className="flex-1 rounded-full border border-purple-400 px-4 py-2 focus:outline-none focus:ring-4 focus:ring-purple-300 transition"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            required
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-full shadow-lg transition"
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
          animation-name: fadeIn;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
