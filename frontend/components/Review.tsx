import React, { useState } from "react";

const Review: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState<string>("");

  const handleStarClick = async (starValue: number) => {
    setRating(starValue);
    setMessage("");

    try {
      const res = await fetch("https://homework-18-production-8b06.up.railway.app/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: starValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Thank you for your rating!");
      } else {
        setMessage(data.error || "Failed to submit rating.");
      }
    } catch (err) {
      setMessage("Failed to submit rating.");
    }
  };

  return (
    <div className="text-center p-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Rate this app
      </h3>

      <div className="text-5xl flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleStarClick(star)}
            className={`transition-transform transform hover:scale-110 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      <p className="mt-4 text-lg text-gray-700">
        Your rating:{" "}
        <span className="font-medium text-indigo-600">
          {rating} star{rating !== 1 ? "s" : ""}
        </span>
      </p>
      {message && <p className="mt-2 text-green-600 font-medium">{message}</p>}
    </div>
  );
};

export default Review;
