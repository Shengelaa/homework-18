"use client";

import Chat from "@/components/Chat";
import PublicChat from "@/components/PublicChat";
import Admin from "@/components/Admin";
import Sms from "../public/Sms.png";
import socket from "@/config/sockets";
import Review from "@/components/Review";

import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [publicEmail, setPublicEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showPublicChat, setShowPublicChat] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [totalMessages, setTotalMessages] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);

  // Review Counter state
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    // Fetch total messages
    fetch("https://homework-18-production-8b06.up.railway.app/count")
      .then((res) => res.json())
      .then((data) => {
        setTotalMessages(data.count ?? 0);
      })
      .catch(() => setTotalMessages(0));

    // Fetch ratings for review counter
    fetch("https://homework-18-production-8b06.up.railway.app/rating")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.ratings)) {
          setReviewCount(data.ratings.length);
          if (data.ratings.length > 0) {
            const sum = data.ratings.reduce((a: number, b: number) => a + b, 0);
            setAverageRating(Number((sum / data.ratings.length).toFixed(2)));
          } else {
            setAverageRating(null);
          }
        }
      })
      .catch(() => {
        setReviewCount(0);
        setAverageRating(null);
      });

    // Listen for real-time message count updates
    socket.on("globalSmsCountUpdated", (count: number) => {
      setTotalMessages(count);
    });

    return () => {
      socket.off("globalSmsCountUpdated");
    };
  }, []);

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

  const handleAdminPannel = () => {
    if (adminPass !== process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      alert("Invalid Admin Code");
      return;
    }
    setShowAdminPanel(true);
  };

  if (showAdminPanel) {
    return <Admin />;
  }

  return (
    <div
      className={`${
        showChat || showPublicChat
          ? "h-screen w-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100"
          : "min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 p-8 flex flex-col items-center"
      } box-border`}
    >
      {showChat ? (
        <Chat roomId={roomId} userEmail={userEmail} />
      ) : showPublicChat ? (
        <PublicChat userEmail={publicEmail} roomId="public" />
      ) : (
        <div className="w-full max-w-3xl space-y-10 box-border">
          <h1 className="text-2xl font-extrabold text-center text-indigo-800 mt-2 drop-shadow-lg mb-6">
            Real-Time Chat App
          </h1>
          <h1 className="mb-[10px] ml-[2px] text-[17px] font-semibold family-arial text-blue-700 flex items-center justify-start flex-row">
            <img src={Sms.src} alt="" width={25} />
            Total Sent Messages:&nbsp;
            <span>{totalMessages === null ? "Loading..." : totalMessages}</span>
          </h1>

          {/* ⭐ Review Counter */}

          <section className="bg-white p-8 rounded-2xl shadow-xl ring-1 ring-green-200 hover:ring-green-300 transition">
            <div className="flex flex-row items-center justify-space-between align-center justify-between ">
              <h2 className="text-2xl font-semibold mb-6 text-green-700 border-b border-green-100 pb-2  ">
                Public Chat
              </h2>
              <h2 className="mb-4 text-lg font-semibold text-green-700 flex items-center justify-center align-center  ">
                App Rating:&nbsp;
                <span className="flex items-center ml-2 justify-center align-center mt-[-2px]">
                  {reviewCount === 0 ? (
                    "No Ratings yet"
                  ) : (
                    <>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            averageRating !== null &&
                            star <= Math.round(averageRating)
                              ? "text-yellow-400 text-2xl"
                              : "text-gray-300 text-2xl flex items-center justify-center align-center "
                          }
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-base text-gray-600"></span>
                    </>
                  )}
                </span>
              </h2>
            </div>
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
            <div className="flex flex-row items-center justify-space-between align-center justify-between mb-6 ">
              <h2 className="text-2xl font-semibold mb-6 text-purple-700 border-b border-purple-200 pb-2">
                Join a Room
              </h2>
              <h2 className="mb-4 text-lg font-semibold  text-purple-700 flex items-center">
                App Rating:&nbsp;
                <span className="flex items-center ml-2 mt-[-3px]">
                  {reviewCount === 0 ? (
                    "No Ratings yet"
                  ) : (
                    <>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            averageRating !== null &&
                            star <= Math.round(averageRating)
                              ? "text-yellow-400 text-2xl"
                              : "text-gray-300 text-2xl"
                          }
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-base text-gray-600"></span>
                    </>
                  )}
                </span>
              </h2>
            </div>
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

          {/* ⭐ Review Trigger Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowReview(true)}
              className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
            >
              Rate Our App
            </button>
          </div>
          <div className="flex justify-center mt-8 flex-row space-x-4">
            <input
              onChange={(e) => setAdminPass(e.target.value)}
              type="password"
              placeholder="Enter Admin Code"
              className="border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-400 bg-white text-red-700 placeholder-red-300 rounded-xl px-4 py-3 shadow-sm transition-all duration-200 focus:outline-none"
              value={adminPass}
            />
            <button
              onClick={handleAdminPannel}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
            >
              Admin Panel
            </button>
          </div>
        </div>
      )}

      {showReview && (
        <div
          className="fixed inset-0 bg-opacity-[0.9] z-50 flex items-center justify-center"
          onClick={() => setShowReview(false)}
        >
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <div className="flex justify-end">
              <button
                onClick={() => setShowReview(false)}
                className="text-red-500 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            <Review />
          </div>
        </div>
      )}
      {/* ⭐ Review Modal */}
    </div>
  );
}
