"use client";

import { useEffect, useState } from "react";
import socket from "@/config/sockets";

type PublicMessage = {
  _id: string;
  userEmail: string;
  msg: string;
};

type PrivateMessage = {
  _id: string;
  userEmail: string;
  msg: string;
};

type PrivateRoom = {
  _id: string;
  roomId: string;
  messages: PrivateMessage[];
};

export default function Admin() {
  const [publicMessages, setPublicMessages] = useState<PublicMessage[]>([]);
  const [privateRooms, setPrivateRooms] = useState<PrivateRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.emit("adminPannel");

    socket.on("adminPannel", ({ publicMessages, privateMessages }) => {
      setPublicMessages(publicMessages);
      setPrivateRooms(privateMessages);
      setLoading(false);
    });

    socket.on("publicMessagesUpdated", (updatedPublicMessages) => {
      setPublicMessages(updatedPublicMessages);
    });

    socket.on("privateMessagesUpdated", (updatedMessages) => {
      setPrivateRooms((rooms) =>
        rooms.map((room) => {
          if (
            room.messages.length > 0 &&
            room.messages[0]._id === updatedMessages[0]?._id
          ) {
            return { ...room, messages: updatedMessages };
          }
          return room;
        })
      );
    });

    socket.on("privateRoomsUpdated", () => {
      socket.emit("adminPannel");
    });

    return () => {
      socket.off("adminPannel");
      socket.off("publicMessagesUpdated");
      socket.off("privateMessagesUpdated");
      socket.off("privateRoomsUpdated");
    };
  }, []);

  const handleDeletePublicMessage = (messageId: string) => {
    socket.emit("deletePublicMessage", { messageId });
  };

  const handleDeletePrivateMessage = (roomId: string, messageId: string) => {
    socket.emit("deletePrivateMessage", { roomId, messageId });
  };

  const handleDeletePrivateRoom = (roomId: string) => {
    if (
      confirm(
        `Are you sure you want to delete room ${roomId} and all its messages?`
      )
    ) {
      socket.emit("deletePrivateRoom", { roomId });
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg font-semibold">
          Loading admin panel data...
        </p>
      </div>
    );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-14 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-indigo-900 drop-shadow-md">
        Admin Panel
      </h1>

      <section>
        <h2 className="text-3xl font-semibold mb-5 text-red-700 border-b-2 border-red-300 pb-2">
          Public Messages
        </h2>
        {publicMessages.length === 0 ? (
          <p className="text-gray-500 italic">No public messages</p>
        ) : (
          <ul className="space-y-4 max-h-96 overflow-y-auto border border-red-200 rounded-lg p-6 bg-white shadow-md">
            {publicMessages.map(({ _id, userEmail, msg }) => (
              <li
                key={_id}
                className="flex justify-between items-center border-b border-red-100 pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-red-800">{userEmail}</p>
                  <p className="text-gray-700">{msg}</p>
                </div>
                <button
                  onClick={() => handleDeletePublicMessage(_id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg shadow-sm transition"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6 text-indigo-800 border-b-2 border-indigo-300 pb-2">
          Private Rooms
        </h2>
        {privateRooms.length === 0 ? (
          <p className="text-gray-500 italic">No private rooms</p>
        ) : (
          <div className="space-y-8 max-h-[600px] overflow-y-auto">
            {privateRooms.map(({ _id, roomId, messages }) => (
              <div
                key={_id || roomId}
                className="border border-indigo-200 rounded-lg p-6 bg-white shadow-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-indigo-900">
                    Room ID: {roomId}
                  </h3>
                  <button
                    onClick={() => handleDeletePrivateRoom(roomId)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg shadow-sm transition"
                  >
                    Delete Room
                  </button>
                </div>
                {messages.length === 0 ? (
                  <p className="text-gray-500 italic">
                    No messages in this room.
                  </p>
                ) : (
                  <ul className="space-y-3 max-h-60 overflow-y-auto">
                    {messages.map(({ _id: msgId, userEmail, msg }) => (
                      <li
                        key={msgId}
                        className="flex justify-between items-center border-b border-indigo-100 pb-2 last:border-b-0"
                      >
                        <div>
                          <p className="font-semibold text-indigo-700">
                            {userEmail}
                          </p>
                          <p className="text-gray-700">{msg}</p>
                        </div>
                        <button
                          onClick={() =>
                            handleDeletePrivateMessage(roomId, msgId)
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg shadow-sm transition"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
