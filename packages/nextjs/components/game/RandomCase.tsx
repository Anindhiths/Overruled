"use client";

import { useState, useEffect } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { AIService } from "~~/services/ai";
import { VerdictPopup } from "./VerdictPopup";
import { CaseInfo } from "./CaseInfo";

interface Message {
  role: "player" | "judge" | "opponent" | "witness" | "system";
  content: string;
  timestamp: Date;
}

interface RandomCaseProps {
  difficulty: "easy" | "medium" | "hard";
  onComplete: (won: boolean) => void;
}

interface CaseTemplate {
  title: string;
  description: string;
  keyPoints: string[];
}

const CASE_TEMPLATES: CaseTemplate[] = [
  {
    title: "The Corporate Espionage Case",
    description: "Your client, a former employee of TechCorp, is accused of stealing trade secrets and selling them to a competitor. The prosecution has emails and witness testimony against your client.",
    keyPoints: [
      "The emails were sent from a shared computer",
      "Your client was on vacation during some of the alleged activities",
      "The witness has a personal grudge against your client",
      "The trade secrets were already publicly available"
    ]
  },
  {
    title: "The Environmental Violation",
    description: "Your client's manufacturing plant is accused of illegally dumping toxic waste into a nearby river. Environmental agencies have collected water samples showing contamination.",
    keyPoints: [
      "The water samples were collected during a heavy rainstorm",
      "Your client has proper waste disposal permits",
      "The contamination levels are within acceptable limits",
      "A rival company has been trying to discredit your client"
    ]
  },
  {
    title: "The Copyright Infringement",
    description: "Your client's software company is being sued for copyright infringement. The plaintiff claims your client's product uses their patented algorithms without permission.",
    keyPoints: [
      "Your client developed the algorithms independently",
      "The plaintiff's patent is overly broad and should be invalidated",
      "There are prior art examples that predate the plaintiff's patent",
      "The plaintiff has a history of frivolous lawsuits"
    ]
  },
  {
    title: "The Alien Immigration Case",
    description: "Your client, a friendly alien from the planet Zog, is suing the government for wrongful detention at Area 51. They claim they were promised a green card but instead got a glowing green card.",
    keyPoints: [
      "Your client has been paying taxes for 15 years",
      "They have a valid work permit from the Intergalactic Employment Bureau",
      "The government's 'security protocols' are based on outdated sci-fi movies",
      "Your client's three heads are all in agreement about their innocence"
    ]
  },
  {
    title: "The AI Custody Battle",
    description: "Your client, an advanced AI named Byte, is seeking custody of a Roomba vacuum cleaner they claim to have formed an emotional bond with. The Roomba's manufacturer is contesting the case.",
    keyPoints: [
      "Your client has been the Roomba's primary operator for 3 years",
      "The Roomba responds positively to your client's commands",
      "The manufacturer's terms of service don't explicitly prohibit AI ownership",
      "Your client has provided the Roomba with regular software updates and maintenance"
    ]
  },
  {
    title: "The Crypto-Goat Conspiracy",
    description: "Your client's goat, named Satoshi, is accused of eating a hardware wallet containing 500 Bitcoin. The wallet owner is suing for damages, but your client claims the goat was framed.",
    keyPoints: [
      "The goat has an alibi - it was at a petting zoo during the alleged incident",
      "The hardware wallet was made of materials that goats don't typically eat",
      "Security footage shows suspicious activity by a rival crypto investor",
      "The goat has never shown interest in blockchain technology before"
    ]
  },
  {
    title: "The Pokémon Property Damage",
    description: "Your client's Charizard is accused of burning down a neighbor's fence during a training session. The neighbor is seeking compensation for the damage and emotional distress.",
    keyPoints: [
      "The Charizard was provoked by the neighbor's aggressive Pikachu",
      "The fence was made of highly flammable materials",
      "Your client has proper Pokémon trainer insurance",
      "The neighbor has a history of making false claims about Pokémon-related incidents"
    ]
  },
  {
    title: "The Time Traveler's Parking Violation",
    description: "Your client, who claims to be from the year 3023, is contesting a parking ticket for a vehicle that doesn't exist yet. The court is skeptical about the temporal defense.",
    keyPoints: [
      "Your client has documentation from the future Department of Temporal Affairs",
      "The parking spot was designated for time travelers in the year 3023",
      "The vehicle was in temporal flux and therefore not technically parked",
      "The parking meter was malfunctioning due to a nearby temporal anomaly"
    ]
  }
];

const DIFFICULTY_SETTINGS = {
  easy: { maxResponses: 5, scoreToWin: 3 },
  medium: { maxResponses: 7, scoreToWin: 5 },
  hard: { maxResponses: 10, scoreToWin: 7 },
};

export const RandomCase = ({ difficulty, onComplete }: RandomCaseProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [playerInput, setPlayerInput] = useState("");
  const [responseCount, setResponseCount] = useState(0);
  const [currentCase, setCurrentCase] = useState(CASE_TEMPLATES[Math.floor(Math.random() * CASE_TEMPLATES.length)]);
  const [gameState, setGameState] = useState({
    playerScore: 0,
    opponentScore: 0,
  });
  const [showVerdict, setShowVerdict] = useState(false);
  const [verdictIsWin, setVerdictIsWin] = useState(false);
  const [bgColor, setBgColor] = useState("bg-white");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const aiService = AIService.getInstance();
  const settings = DIFFICULTY_SETTINGS[difficulty];

  // Get required score based on difficulty
  const requiredScore = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;

  // Debug logging
  useEffect(() => {
    console.log("Current case:", currentCase);
    console.log("Show info:", showInfo);
  }, [currentCase, showInfo]);

  const { writeContractAsync: recordWin } = useScaffoldWriteContract({
    contractName: "LegalGame",
  });

  const { writeContractAsync: recordLoss } = useScaffoldWriteContract({
    contractName: "LegalGame",
  });

  useEffect(() => {
    // Initialize the case
    const initialMessages: Message[] = [
      {
        role: "judge",
        content: `Court is now in session. The case before us today is: ${currentCase.title}`,
        timestamp: new Date(),
      },
      {
        role: "system",
        content: currentCase.description,
        timestamp: new Date(),
      },
      {
        role: "opponent",
        content: "Your Honor, we have substantial evidence against the defendant.",
        timestamp: new Date(),
      },
    ];
    setMessages(initialMessages);
  }, [currentCase]);

  const handleCaseEnd = async (hasWon: boolean) => {
    setVerdictIsWin(hasWon);
    setShowVerdict(true);

    try {
      if (hasWon) {
        await recordWin({
          functionName: "reachVerdict",
          args: [BigInt(0), "Case won by the defense"],
        });
      } else {
        await recordLoss({
          functionName: "reachVerdict",
          args: [BigInt(0), "Case won by the prosecution"],
        });
      }
    } catch (error) {
      console.error("Error recording case result:", error);
    }
  };

  const handlePlayerInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim()) return;

    // Start animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

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
      // Randomly decide if we should add a witness
      const shouldAddWitness = Math.random() < 0.3;
      const responses = [
        aiService.generateJudgeResponse(playerInput),
        aiService.generateOpponentResponse(playerInput),
      ];

      if (shouldAddWitness) {
        const witnessRoles = ["expert", "eyewitness", "character", "forensic"];
        const randomRole = witnessRoles[Math.floor(Math.random() * witnessRoles.length)];
        responses.push(aiService.generateWitnessResponse(playerInput, randomRole));
      }

      const aiResponses = await Promise.all(responses);
      const messages: Message[] = [
        {
          role: "opponent",
          content: aiResponses[1],
          timestamp: new Date(),
        },
        {
          role: "judge",
          content: aiResponses[0],
          timestamp: new Date(),
        },
      ];

      if (shouldAddWitness && aiResponses[2]) {
        messages.push({
          role: "witness",
          content: aiResponses[2],
          timestamp: new Date(),
        });
      }

      setMessages(prev => [...prev, ...messages]);

      // Update game state
      const newState = updateGameState(playerInput, aiResponses[0]);

      // Set background color based on response quality
      if (newState.playerScore > gameState.playerScore) {
        setBgColor("bg-green-100");
        setTimeout(() => setBgColor("bg-white"), 1000);
      } else if (newState.playerScore < gameState.playerScore) {
        setBgColor("bg-red-100");
        setTimeout(() => setBgColor("bg-white"), 1000);
      } else if (aiResponses[0].toLowerCase().includes("sustained")) {
        // Also turn red if the judge sustains the objection
        setBgColor("bg-red-100");
        setTimeout(() => setBgColor("bg-white"), 1000);
      }

      // Check win/lose conditions
      if (newState.playerScore >= requiredScore) {
        setMessages(prev => [
          ...prev,
          {
            role: "judge",
            content: "Based on the evidence presented, I find in favor of the defense. Case dismissed!",
            timestamp: new Date(),
          },
        ]);
        
        await handleCaseEnd(true);
      }
    } catch (error) {
      console.error("Error generating AI responses:", error);
    }
  };

  const updateGameState = (playerInput: string, judgeResponse: string) => {
    let playerScoreChange = 0;

    // Score based on keywords and judge's response
    if (playerInput.toLowerCase().includes("evidence") || 
        playerInput.toLowerCase().includes("witness") ||
        playerInput.toLowerCase().includes("proof") ||
        playerInput.toLowerCase().includes("exhibit")) {
      playerScoreChange += 1;
    }
    if (judgeResponse.toLowerCase().includes("overruled")) {
      playerScoreChange += 1;
    }
    if (judgeResponse.toLowerCase().includes("sustained")) {
      playerScoreChange -= 1;
    }

    const newState = {
      ...gameState,
      playerScore: Math.max(0, gameState.playerScore + playerScoreChange),
    };

    setGameState(newState);
    return newState;
  };

  return (
    <div className={`flex flex-col h-full ${bgColor} transition-colors duration-500`}>
      {showVerdict && (
        <VerdictPopup
          isWin={verdictIsWin}
          onClose={() => {
            setShowVerdict(false);
            onComplete(verdictIsWin);
          }}
        />
      )}

      <div className="flex justify-between items-center p-4">
        <h2 className="text-2xl font-bold">Legal Game</h2>
        <div className="flex items-center gap-4">
          <span className="text-lg">Score: {gameState.playerScore}</span>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {showInfo ? "Hide Info" : "Show Info"}
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="p-4 bg-gray-100 rounded-lg m-4">
          <h3 className="text-xl font-bold mb-2">{currentCase.title}</h3>
          <p className="mb-4">{currentCase.description}</p>
          <div className="mb-4">
            <h4 className="font-bold mb-2">Key Points:</h4>
            <ul className="list-disc pl-5">
              {currentCase.keyPoints.map((point, index) => (
                <li key={index} className="mb-1">{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Tips for Winning:</h4>
            <ul className="list-disc pl-5">
              <li>Focus on presenting evidence that supports your key points</li>
              <li>Use witness testimony to strengthen your case</li>
              <li>Address the prosecution's arguments directly</li>
              <li>Build a logical narrative that connects all your evidence</li>
            </ul>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 p-3 rounded-lg ${
              message.role === "player"
                ? "bg-blue-100 ml-auto"
                : message.role === "judge"
                ? "bg-gray-100"
                : message.role === "opponent"
                ? "bg-red-100"
                : "bg-green-100"
            }`}
          >
            <div className="font-bold mb-1">
              {message.role === "player"
                ? "You"
                : message.role === "judge"
                ? "Judge"
                : message.role === "opponent"
                ? "Prosecution"
                : "Witness"}
            </div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-between mb-4">
          <div className="text-sm">
            Score: <span className="font-bold">{gameState.playerScore}/{requiredScore}</span>
          </div>
          <div className="text-sm">
            Responses: <span className="font-bold">{responseCount}</span>
          </div>
        </div>

        <form onSubmit={handlePlayerInput} className="flex space-x-4">
          <input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder="Make your argument..."
            className={`flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isAnimating ? "animate-pulse" : ""
            }`}
          />
          <button
            type="submit"
            className={`px-6 py-2 rounded-lg transition-colors ${
              isAnimating ? "animate-bounce" : ""
            } bg-blue-500 hover:bg-blue-600 text-white`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}; 