import socket from "@/config/sockets";
import React, { FormEvent, useEffect, useRef, useState } from "react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listenerAttached = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendPublicMsg = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!msg.trim()) return;

    const newMsg: MessageType = {
      userEmail,
      msg,
      timestamp: new Date().toISOString(),
    };

    socket.emit("publicMessage", newMsg);
    setMsg("");
  };

  useEffect(() => {
    if (listenerAttached.current) return;

    socket.on("publicMessage", (data: MessageType) => {
      setMessages((prev) => [...prev, data]);
    });
    socket.on("publicMessages", (data: MessageType[]) => {
    setMessages(data);
  });

    listenerAttached.current = true;

    return () => {
      socket.off("publicMessage");
      listenerAttached.current = false;
    };
  }, []);

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-200 to-emerald-300 flex flex-col items-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl p-6 flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-green-800 flex items-center gap-2">
            🌐 Public Chat
          </h1>
          <button
            className="text-sm text-green-600 hover:text-green-800 font-semibold"
            onClick={() => window.location.reload()}
            aria-label="Leave public chat"
          >
            Leave
          </button>
        </header>

        <div
          className="flex-1 overflow-y-auto space-y-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-green-100"
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
                        ? "bg-green-200 ml-auto text-right"
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
          onSubmit={handleSendPublicMsg}
          className="mt-6 flex gap-3 items-center"
          aria-label="Send public message"
        >
          <input
            type="text"
            placeholder="Write your message..."
            className="flex-1 rounded-full border border-green-400 px-4 py-2 focus:outline-none focus:ring-4 focus:ring-green-300 transition"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            required
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-full shadow-lg transition"
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
