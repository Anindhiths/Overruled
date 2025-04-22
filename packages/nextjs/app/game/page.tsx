"use client";

import { useState, useEffect } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import { TutorialCase } from "~~/components/game/TutorialCase";
import { RandomCase } from "~~/components/game/RandomCase";

interface GameStats {
  gamesWon: number;
  gamesLost: number;
  currentStreak: number;
}

const GamePage = () => {
  const { address } = useAccount();
  const [showTutorial, setShowTutorial] = useState(true);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    gamesWon: 0,
    gamesLost: 0,
    currentStreak: 0,
  });
  const [showStats, setShowStats] = useState(false);

  const { data: legalGameContract } = useScaffoldContract({
    contractName: "LegalGame",
  });

  const handleTutorialComplete = () => {
    setHasCompletedTutorial(true);
    setShowTutorial(false);
    setShowStats(false);
  };

  const handleCaseComplete = (won: boolean) => {
    setGameStats(prev => ({
      gamesWon: prev.gamesWon + (won ? 1 : 0),
      gamesLost: prev.gamesLost + (won ? 0 : 1),
      currentStreak: won ? prev.currentStreak + 1 : 0,
    }));
    setShowStats(true);
  };

  const startNextCase = () => {
    setShowStats(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!hasCompletedTutorial && showTutorial && (
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Overruled!</h1>
          <button
            onClick={() => {
              setShowTutorial(false);
              setHasCompletedTutorial(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Skip Tutorial
          </button>
        </div>
      )}

      {hasCompletedTutorial && (
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Overruled!</h1>
        </div>
      )}

      {showTutorial ? (
        <TutorialCase onComplete={handleTutorialComplete} />
      ) : showStats ? (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Case Results</h2>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{gameStats.gamesWon}</div>
              <div className="text-sm text-gray-600">Cases Won</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{gameStats.gamesLost}</div>
              <div className="text-sm text-gray-600">Cases Lost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{gameStats.currentStreak}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={startNextCase}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continue to Next Case
            </button>
          </div>
        </div>
      ) : (
        <RandomCase onComplete={handleCaseComplete} />
      )}
    </div>
  );
};

export default GamePage; 