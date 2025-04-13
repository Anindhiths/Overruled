import { useState, useEffect, useRef } from "react";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { AIService } from "~~/services/ai";

interface CourtRoomProps {
  currentCase: any;
  onVerdict: () => void;
}

interface Message {
  role: "player" | "judge" | "opponent" | "witness";
  content: string;
  timestamp: Date;
}

export const CourtRoom = ({ currentCase, onVerdict }: CourtRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [playerInput, setPlayerInput] = useState("");
  const [currentPhase, setCurrentPhase] = useState("opening");
  const [gameState, setGameState] = useState({
    playerScore: 0,
    opponentScore: 0,
    evidenceSubmitted: 0,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: legalGameContract } = useScaffoldContract({
    contractName: "LegalGame",
  });

  const aiService = AIService.getInstance();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize the courtroom with opening statements
    const initialMessages: Message[] = [
      {
        role: "judge",
        content: "Court is now in session. The case before us today is: " + currentCase?.title,
        timestamp: new Date(),
      },
      {
        role: "opponent",
        content: "Your honor, we will prove that the defendant is guilty of the charges.",
        timestamp: new Date(),
      },
    ];
    setMessages(initialMessages);
  }, [currentCase]);

  const handlePlayerInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim()) return;

    // Add player's message
    const newMessage: Message = {
      role: "player",
      content: playerInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setPlayerInput("");

    // Get AI responses
    try {
      const [judgeResponse, opponentResponse] = await Promise.all([
        aiService.generateJudgeResponse(playerInput),
        aiService.generateOpponentResponse(playerInput),
      ]);

      // Randomly decide if we should add a witness response
      const shouldAddWitness = Math.random() < 0.3; // 30% chance
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

      if (shouldAddWitness) {
        const witnessRoles = ["expert", "eyewitness", "character", "forensic"];
        const randomRole = witnessRoles[Math.floor(Math.random() * witnessRoles.length)];
        const witnessResponse = await aiService.generateWitnessResponse(playerInput, randomRole);
        aiResponses.push({
          role: "witness",
          content: witnessResponse,
          timestamp: new Date(),
        });
      }

      setMessages(prev => [...prev, ...aiResponses]);

      // Update game state based on responses
      updateGameState(playerInput, judgeResponse, opponentResponse);
    } catch (error) {
      console.error("Error generating AI responses:", error);
    }
  };

  const updateGameState = (playerInput: string, judgeResponse: string, opponentResponse: string) => {
    // Simple scoring system based on response content
    let playerScoreChange = 0;
    let opponentScoreChange = 0;

    // Analyze responses and update scores
    if (judgeResponse.toLowerCase().includes("sustained")) {
      opponentScoreChange += 1;
    }
    if (judgeResponse.toLowerCase().includes("overruled")) {
      playerScoreChange += 1;
    }

    setGameState(prev => ({
      ...prev,
      playerScore: prev.playerScore + playerScoreChange,
      opponentScore: prev.opponentScore + opponentScoreChange,
    }));
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-lg shadow-lg">
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
                  : "bg-green-500 text-white"
              }`}
            >
              <div className="font-semibold mb-1">
                {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
              </div>
              <div>{message.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-between mb-4">
          <div className="text-sm">
            Your Score: <span className="font-bold">{gameState.playerScore}</span>
          </div>
          <div className="text-sm">
            Opponent Score: <span className="font-bold">{gameState.opponentScore}</span>
          </div>
        </div>

        <form onSubmit={handlePlayerInput} className="flex space-x-4">
          <input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder="Make your argument..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}; 