"use client";

import { useEffect, useState } from "react";

interface VerdictPopupProps {
  isWin: boolean;
  onClose: () => void;
}

export const VerdictPopup = ({ isWin, onClose }: VerdictPopupProps) => {
  const [thumbsCount, setThumbsCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setThumbsCount(prev => {
        if (prev < (isWin ? 4 : 5)) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 500);

    // Auto close after animation
    const timeout = setTimeout(() => {
      onClose();
    }, (isWin ? 4 : 5) * 500 + 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isWin, onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-8 text-center transform scale-100 transition-transform">
        <h2 className="text-2xl font-bold mb-4">
          {isWin ? "Case Won! 🎉" : "Case Lost"}
        </h2>
        <div className="flex gap-2 justify-center mb-4">
          {Array.from({ length: thumbsCount }).map((_, i) => (
            <span key={i} className="text-4xl">
              {isWin ? "👍" : "👎"}
            </span>
          ))}
        </div>
        <p className={`text-xl ${isWin ? "text-green-600" : "text-red-600"}`}>
          {isWin ? "Justice has been served!" : "Better luck next time!"}
        </p>
      </div>
    </div>
  );
}; 