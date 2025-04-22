"use client";

import { useState, useEffect } from "react";

interface VerdictPopupProps {
  isWin: boolean;
  onClose: () => void;
}

export const VerdictPopup = ({ isWin, onClose }: VerdictPopupProps) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Delay showing the popup for 2.5 seconds
    const timer = setTimeout(() => {
      setVisible(true);
    }, 2500);
    
    // Clean up timer when component unmounts
    return () => clearTimeout(timer);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg p-8 text-center shadow-xl max-w-md animate-scaleIn">
        <h2 className={`text-2xl font-bold mb-4 ${isWin ? "text-green-600" : "text-red-600"}`}>
          {isWin ? "Case Won! 🎉" : "Case Lost"}
        </h2>
        
        <p className="text-lg mb-6">
          {isWin 
            ? "Congratulations! Your arguments were compelling and the judge ruled in your favor." 
            : "The judge was not convinced by your arguments this time."}
        </p>
        
        <button
          onClick={onClose}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          Continue to Next Case
        </button>
      </div>
    </div>
  );
}; 