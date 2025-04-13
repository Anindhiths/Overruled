"use client";

import { useState, useEffect } from "react";
import { AIService } from "~~/services/ai";
import { VerdictPopup } from "./VerdictPopup";

interface Message {
  role: "player" | "judge" | "opponent" | "witness" | "system";
  content: string;
  timestamp: Date;
}

export const TutorialCase = ({ onComplete }: { onComplete: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [playerInput, setPlayerInput] = useState("");
  const [responseCount, setResponseCount] = useState(0);
  const [gameState, setGameState] = useState({
    playerScore: 0,
    opponentScore: 0,
  });
  const [showVerdict, setShowVerdict] = useState(false);
  const [verdictIsWin, setVerdictIsWin] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [bgColor, setBgColor] = useState("bg-white");
  const aiService = AIService.getInstance();

  const MAX_RESPONSES = 3;
  const SCORE_TO_WIN = 2;

  // Case information
  const caseInfo = {
    title: "The Missing Cookie Case",
    description: "You are defending your client who has been accused of stealing cookies from the office kitchen. The prosecution claims to have a witness who saw your client near the cookie jar at the time of the incident.",
    keyPoints: [
      "Your client has a strong alibi - they were in a meeting at the time",
      "The witness's testimony is unreliable - they were wearing glasses but claim to have perfect vision",
      "Security cameras were not working that day",
      "Multiple people had access to the kitchen",
    ],
    tips: [
      "Mention the meeting alibi in your first response",
      "Question the witness's credibility in your second response",
      "Use the security camera issue as supporting evidence",
    ],
  };

  useEffect(() => {
    // Initialize the tutorial case
    const initialMessages: Message[] = [
      {
        role: "system",
        content: "Welcome to the Tutorial Case! This is a practice case to help you learn the game.",
        timestamp: new Date(),
      },
      {
        role: "judge",
        content: "Court is now in session. The case before us today is: The Missing Cookie Case",
        timestamp: new Date(),
      },
      {
        role: "system",
        content: caseInfo.description,
        timestamp: new Date(),
      },
      {
        role: "opponent",
        content: "Your Honor, we have a witness who saw the defendant near the cookie jar!",
        timestamp: new Date(),
      },
      {
        role: "system",
        content: "Tip: Try saying 'Your Honor, my client was in a meeting at the time of the incident.'",
        timestamp: new Date(),
      },
    ];
    setMessages(initialMessages);
  }, []);

  const handleCaseEnd = (hasWon: boolean) => {
    setVerdictIsWin(hasWon);
    setShowVerdict(true);
  };

  const handlePlayerInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim()) return;

    const newResponseCount = responseCount + 1;
    setResponseCount(newResponseCount);

    // Add player's message
    const newMessage: Message = {
      role: "player",
      content: playerInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setPlayerInput("");

    try {
      const [judgeResponse, opponentResponse] = await Promise.all([
        aiService.generateJudgeResponse(playerInput),
        aiService.generateOpponentResponse(playerInput),
      ]);

      let aiResponses: Message[] = [
        {
          role: "opponent",
          content: opponentResponse,
          timestamp: new Date(),
        },
        {
          role: "judge",
          content: judgeResponse,
          timestamp: new Date(),
        },
      ];

      // Add tutorial guidance
      if (newResponseCount === 1) {
        aiResponses.push({
          role: "system",
          content: "Good! For your next response, try questioning the witness's credibility.",
          timestamp: new Date(),
        });
      } else if (newResponseCount === 2) {
        aiResponses.push({
          role: "system",
          content: "For your final response, mention the security cameras were not working.",
          timestamp: new Date(),
        });
      }

      setMessages(prev => [...prev, ...aiResponses]);

      // Update score and background color
      const newState = updateGameState(playerInput, judgeResponse);
      
      // Set background color based on response quality
      if (newState.playerScore > gameState.playerScore) {
        setBgColor("bg-green-100");
        setTimeout(() => setBgColor("bg-white"), 1000);
      } else if (newState.playerScore < gameState.playerScore) {
        setBgColor("bg-red-100");
        setTimeout(() => setBgColor("bg-white"), 1000);
      }

      // End tutorial after max responses
      if (newResponseCount >= MAX_RESPONSES) {
        const hasWon = newState.playerScore >= SCORE_TO_WIN;
        setMessages(prev => [
          ...prev,
          {
            role: "judge",
            content: hasWon
              ? "Having heard the arguments, I find the defendant NOT GUILTY. Case dismissed!"
              : "Having heard the arguments, I find the defendant GUILTY.",
            timestamp: new Date(),
          },
        ]);
        handleCaseEnd(hasWon);
      }
    } catch (error) {
      console.error("Error generating AI responses:", error);
    }
  };

  const updateGameState = (playerInput: string, judgeResponse: string) => {
    let playerScoreChange = 0;

    // Enhanced scoring for tutorial
    if (playerInput.toLowerCase().includes("meeting") || 
        playerInput.toLowerCase().includes("alibi")) {
      playerScoreChange += 2; // Double points for using the meeting alibi
    }
    if (playerInput.toLowerCase().includes("witness") && 
        (playerInput.toLowerCase().includes("credibility") || 
         playerInput.toLowerCase().includes("glasses") ||
         playerInput.toLowerCase().includes("vision"))) {
      playerScoreChange += 2; // Double points for questioning witness credibility
    }
    if (playerInput.toLowerCase().includes("camera") || 
        playerInput.toLowerCase().includes("security")) {
      playerScoreChange += 2; // Double points for mentioning security cameras
    }
    if (playerInput.toLowerCase().includes("evidence") || 
        playerInput.toLowerCase().includes("proof")) {
      playerScoreChange += 1;
    }

    const newState = {
      ...gameState,
      playerScore: gameState.playerScore + playerScoreChange,
    };

    setGameState(newState);
    return newState;
  };

  return (
    <div className={`flex flex-col h-[80vh] ${bgColor} rounded-lg shadow-lg transition-colors duration-500`}>
      {showVerdict && (
        <VerdictPopup
          isWin={verdictIsWin}
          onClose={() => {
            setShowVerdict(false);
            onComplete();
          }}
        />
      )}

      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Tutorial Case: The Missing Cookie</h2>
          <p className="text-sm">
            Responses Left: {MAX_RESPONSES - responseCount} |
            Score Needed: {SCORE_TO_WIN}
          </p>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-800 transition-colors"
        >
          {showInfo ? "Hide Info" : "Show Info"}
        </button>
      </div>

      {showInfo && (
        <div className="bg-blue-50 p-4 border-b border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">Case Information</h3>
          <div className="space-y-2">
            <p><span className="font-semibold">Title:</span> {caseInfo.title}</p>
            <p><span className="font-semibold">Description:</span> {caseInfo.description}</p>
            <div>
              <span className="font-semibold">Key Points:</span>
              <ul className="list-disc list-inside ml-4">
                {caseInfo.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-semibold">Tips:</span>
              <ul className="list-disc list-inside ml-4">
                {caseInfo.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "player" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.role === "player"
                  ? "bg-blue-500 text-white"
                  : message.role === "judge"
                  ? "bg-gray-200 text-gray-800"
                  : message.role === "opponent"
                  ? "bg-red-500 text-white"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}
            >
              <div className="font-semibold mb-1">
                {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
              </div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-between mb-4">
          <div className="text-sm">
            Score: <span className="font-bold">{gameState.playerScore}/{SCORE_TO_WIN}</span>
          </div>
          <div className="text-sm">
            Responses: <span className="font-bold">{responseCount}/{MAX_RESPONSES}</span>
          </div>
        </div>

        <form onSubmit={handlePlayerInput} className="flex space-x-4">
          <input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder="Make your argument..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={responseCount >= MAX_RESPONSES}
          />
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg transition-colors ${
              responseCount >= MAX_RESPONSES
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={responseCount >= MAX_RESPONSES}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}; 