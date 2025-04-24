"use client";

import { useState, useEffect } from "react";
import { AIService } from "~~/services/ai";
import { VerdictPopup } from "./VerdictPopup";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import toast from "react-hot-toast";

interface Message {
  role: "player" | "judge" | "opponent" | "witness" | "system";
  content: string;
  timestamp: Date;
}

export const TutorialCase = ({ onComplete }: { onComplete: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
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
  const [isPoorPerformance, setIsPoorPerformance] = useState(false);
  const [isReadyForVerdict, setIsReadyForVerdict] = useState(false);
  const aiService = AIService.getInstance();

  const MAX_RESPONSES = 3;
  const SCORE_TO_WIN = 2;

  // Add contract interaction
  const { writeContractAsync: completeTutorialAsync } = useScaffoldWriteContract({
    contractName: "LegalGame",
  });

  // Case information
  const caseInfo = {
    title: "The Missing Cookie Case",
    description: "You are defending your client who has been accused of stealing cookies from the office kitchen. The prosecution claims to have a witness who saw your client near the cookie jar at the time of the incident.",
    detailedStory: "At approximately 2:30 PM last Tuesday, a batch of freshly baked chocolate chip cookies disappeared from the office kitchen counter. The cookies were baked by Ms. Johnson, the office manager, for the afternoon team meeting. Your client, Alex, was seen by the office intern entering the kitchen around 2:25 PM. However, Alex maintains that they simply went to get coffee and never touched the cookies. Alex has phone records showing they were on a conference call from 2:15 PM to 2:45 PM. The witness, intern Tim Davis, claims to have perfect vision but his employee records show he wears prescription glasses which he wasn't wearing that day. Additionally, the security cameras that normally monitor the kitchen area were under maintenance and not working. Several other employees had access to the kitchen during the time in question, including the CEO's assistant who has a known sweet tooth.",
    tips: [
      "Mention the meeting alibi in your first response",
      "Question the witness's credibility in your second response",
      "Use the security camera issue as supporting evidence",
    ],
  };

  // Initialize the tutorial case
  useEffect(() => {
    // Create initial messages in queue instead of using setTimeout
    const initialMessageQueue: Message[] = [
      {
        role: "system",
        content: " Welcome to the Tutorial Case! This is a practice case to help you learn the game.",
        timestamp: new Date(),
      },
      {
        role: "judge",
        content: " Court is now in session. The case before us today is: The Missing Cookie Case",
        timestamp: new Date(),
      },
      {
        role: "system",
        content: " " + caseInfo.description,
        timestamp: new Date(),
      },
      {
        role: "opponent",
        content: " Your Honor, we have a witness who saw the defendant near the cookie jar!",
        timestamp: new Date(),
      },
      {
        role: "system",
        content: " Tip: Try saying 'Your Honor, my client was in a meeting at the time of the incident.'",
        timestamp: new Date(),
      }
    ];
    
    // Display first message and queue the rest
    setMessages([initialMessageQueue[0]]);
    setMessageQueue(initialMessageQueue.slice(1));
  }, []);

  // Handle the Next button click
  const advanceDialogue = () => {
    // If we're ready for the verdict, show it now
    if (isReadyForVerdict) {
      const hasWon = gameState.playerScore >= SCORE_TO_WIN;
      handleCaseEnd(hasWon);
      return;
    }
    
    if (messageQueue.length > 0 && !isPoorPerformance) {
      // Take the next message from the queue
      const nextMessage = messageQueue[0];
      
      // Add it to displayed messages
      setMessages(prev => [...prev, nextMessage]);
      
      // Remove it from the queue
      setMessageQueue(prev => prev.slice(1));
      
      // Check if this was the final "Waiting for verdict" message
      if (nextMessage.role === "system" && nextMessage.content.includes("Waiting for final verdict")) {
        setIsReadyForVerdict(true);
      }
    }
  };

  const handleCaseEnd = async (hasWon: boolean) => {
    setVerdictIsWin(hasWon);
    setShowVerdict(true);
    
    // Record tutorial completion on the blockchain to receive tokens
    try {
      // Call the completeTutorial function on the smart contract
      await completeTutorialAsync({
        functionName: "completeTutorial",
      });
      
      console.log("Tutorial completion recorded on blockchain");
    } catch (error) {
      console.error("Error recording tutorial completion:", error);
    }
  };

  // Add this function before handlePlayerInput
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

  const handlePlayerInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim() || isPoorPerformance) return;

    const newResponseCount = responseCount + 1;
    setResponseCount(newResponseCount);

    // Skip adding player's message to visible messages
    const playerMessage = {
      role: "player",
      content: playerInput,
      timestamp: new Date(),
    };
    
    setPlayerInput("");

    try {
      setIsPoorPerformance(true);
      
      // Add grammar note for AI responses
      const grammarNote = "Please ensure your response is grammatically correct and well-structured with proper sentences and punctuation.";
      
      // Get responses sequentially to avoid potential truncation
      console.log("Getting opponent response...");
      const opponentResponse = await aiService.generateOpponentResponse(`${playerInput}\n\n${grammarNote}`);
      
      // Wait a moment to avoid rate limiting (if needed)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Getting judge response...");
      const judgeResponse = await aiService.generateJudgeResponse(`${playerInput}\n\n${grammarNote}`);

      // Update score based on response quality
      const newState = updateGameState(playerInput, judgeResponse);
      
      // Check if response contains problematic phrases
      const lowerJudge = judgeResponse.toLowerCase();
      const lowerPlayer = playerInput.toLowerCase();
      
      const hasBadKeywords = [
        "sustained", "irrelevant", "lacks foundation", "improper",
        "speculation", "hearsay", "argumentative"
      ].some(word => lowerJudge.includes(word));
      
      const isTooShort = playerInput.length < 20;
      const isRude = ["stupid", "idiot", "dumb", "ridiculous"].some(word => lowerPlayer.includes(word));
      const missingCourtesy = !lowerPlayer.includes("your honor") && !lowerPlayer.includes("judge");
      
      // Set background color based on quality of response
      if (newState.playerScore > gameState.playerScore && !hasBadKeywords && !isRude) {
        // Good response - green background
        setBgColor("bg-green-100");
        setTimeout(() => setBgColor("bg-white"), 1500);
      } else if (hasBadKeywords || isTooShort || isRude || missingCourtesy) {
        // Bad response - red background
        setBgColor("bg-red-100");
        setTimeout(() => setBgColor("bg-white"), 1500);
      }

      // Create a new message queue instead of using setTimeout
      const newMessageQueue: Message[] = [
        {
          role: "opponent",
          content: " " + opponentResponse,
          timestamp: new Date(),
        },
        {
          role: "judge",
          content: " " + judgeResponse,
          timestamp: new Date(),
        }
      ];
      
      // Add tutorial guidance based on response count
      if (newResponseCount === 1) {
        newMessageQueue.push({
          role: "system",
          content: " Good! For your next response, try 'I question the witness's credibility.",
          timestamp: new Date(),
        });
      } else if (newResponseCount === 2) {
        newMessageQueue.push({
          role: "system",
          content: " For your final response, mention 'The security cameras were not working.",
          timestamp: new Date(),
        });
      }
      
      // End tutorial after max responses
      if (newResponseCount >= MAX_RESPONSES) {
        const hasWon = newState.playerScore >= SCORE_TO_WIN;
        newMessageQueue.push({
          role: "judge",
          content: hasWon
            ? " Having heard the arguments, I find the defendant NOT GUILTY. Case dismissed!"
            : " Having heard the arguments, I find the defendant GUILTY.",
          timestamp: new Date(),
        });
        
        // Add final system message
        newMessageQueue.push({
          role: "system",
          content: " Waiting for final verdict...",
          timestamp: new Date(),
        });
      }
      
      console.log("All responses obtained:", newMessageQueue);
      
      // Add first message from queue to displayed messages and queue the rest
      if (newMessageQueue.length > 0) {
        console.log("Displaying first message:", newMessageQueue[0]);
        setMessages(prev => [...prev, newMessageQueue[0]]);
        
        // Queue the rest of the messages
        if (newMessageQueue.length > 1) {
          setMessageQueue(newMessageQueue.slice(1));
        }
      }
      
      setIsPoorPerformance(false);
      
    } catch (error) {
      console.error("Error generating AI responses:", error);
      toast.error("Something went wrong with the response generation.");
      setIsPoorPerformance(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Courtroom Background Image */}
      <div 
        className="fixed inset-0 h-full w-full"
        style={{ 
          backgroundImage: 'url("/images/Courtroom Background.png")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1, 
        }}
      ></div>

      {/* No white overlay anymore to make courtroom more visible */}

      {/* Content */}
      <div className={`relative z-10 flex flex-col h-screen transition-colors duration-500`}>
      {showVerdict && (
        <VerdictPopup
          isWin={verdictIsWin}
          onClose={() => {
            setShowVerdict(false);
            onComplete();
          }}
        />
      )}

        {/* Top bar with title and controls */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
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

        {/* Case info panel - only visible when showInfo is true */}
      {showInfo && (
          <div className="bg-blue-50/90 backdrop-blur-sm p-4 border-b border-blue-200 max-h-[200px] overflow-y-auto">
          <h3 className="font-bold text-blue-800 mb-2">Case Information</h3>
          <div className="space-y-2">
            <p><span className="font-semibold">Title:</span> {caseInfo.title}</p>
            <p><span className="font-semibold">Description:</span> {caseInfo.description}</p>
            <div>
              <span className="font-semibold">What Really Happened:</span>
              <p className="mt-1 ml-4 text-sm">{caseInfo.detailedStory}</p>
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

        {/* Main visual novel style interface */}
        <div className="flex-1 flex flex-col relative">
          {/* Character display area - takes up most of the screen */}
          <div className="flex-1 flex justify-center items-center">
            {/* Display empty image when no character is shown or system message is displayed */}
            {messages.length > 0 && (
              <div className="character-display flex items-center justify-center h-full relative">
                {(() => {
                  // Get the last message to determine who's speaking
                  const lastMessage = messages[messages.length - 1];
                  
                  // Use empty.png for system messages or player messages
                  if (lastMessage.role === 'system' || lastMessage.role === 'player') {
                    return (
                      <div className="character-container text-center">
                        <img 
                          src="/images/characters/empty.png"
                          alt="Case Information"
                          className="h-96 object-contain mx-auto"
                          style={{
                            filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.5))"
                          }}
                        />
                      </div>
                    );
                  }
                  
                  // Determine which character image to show
                  let characterImage = "";
                  let characterName = "";
                  
                  if (lastMessage.role === "judge") {
                    characterImage = lastMessage.content.toLowerCase().includes("not guilty") || 
                       lastMessage.content.toLowerCase().includes("case dismissed") ||
                       (showVerdict && verdictIsWin)
                       ? "/images/characters/judge_happy.png"
                       : "/images/characters/judge_neutral.png";
                    characterName = "Judge";
                  }
                  else if (lastMessage.role === "opponent") {
                    characterImage = "/images/characters/prosecutor_neutral.png";
                    characterName = "Prosecutor";
                  }
                  else if (lastMessage.role === "witness") {
                    characterImage = "/images/characters/witness_1.png";
                    characterName = "Witness";
                  }
                  
                  return characterImage ? (
                    <div className="character-container text-center">
                      <img 
                        src={characterImage}
                        alt={characterName}
                        className="h-96 object-contain mx-auto"
                        style={{
                          filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.5))"
                        }}
                      />
                      <div className="mt-2 text-xl font-bold text-white bg-black/40 py-1 px-4 rounded-full inline-block">
                        {characterName}
                      </div>
                    </div>
                  ) : (
                    // Fallback to empty.png if no character image is found
                    <div className="character-container text-center">
                      <img 
                        src="/images/characters/empty.png"
                        alt="No Character"
                        className="h-96 object-contain mx-auto"
                        style={{
                          filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.5))"
                        }}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          {/* Bottom dialogue box - like in visual novels */}
          <div className="dialogue-box bg-gray-800/90 backdrop-blur-sm text-white p-6 rounded-t-xl min-h-[350px] w-full shadow-lg relative">
            {/* Speaker name tag if not player or system */}
            {messages.length > 0 && !['player', 'system'].includes(messages[messages.length - 1].role) && (
              <div className="absolute -top-5 left-8 bg-blue-600 text-white px-4 py-1 rounded-t-lg font-bold">
                {(() => {
                  const lastMessage = messages[messages.length - 1];
                  switch(lastMessage.role) {
                    case "judge": return "Judge";
                    case "opponent": return "Prosecutor";
                    case "witness": return "Witness";
                    default: return lastMessage.role;
                  }
                })()}
              </div>
            )}
            
            {/* System message styling */}
            {messages.length > 0 && messages[messages.length - 1].role === 'system' && (
              <div className="absolute -top-5 left-8 bg-yellow-500 text-gray-900 px-4 py-1 rounded-t-lg font-bold">
                Tutorial Tip
      </div>
            )}
            
            {/* Game progress indicator */}
            <div className="flex justify-between text-sm text-gray-300 absolute top-3 right-6">
              <div className="mr-4">
            Score: <span className="font-bold">{gameState.playerScore}/{SCORE_TO_WIN}</span>
          </div>
              <div>
            Responses: <span className="font-bold">{responseCount}/{MAX_RESPONSES}</span>
          </div>
        </div>

            {/* Message content with typewriter effect */}
            <div className="dialogue-content text-xl mb-20 overflow-y-auto max-h-[250px] whitespace-pre-wrap leading-relaxed">
              {messages.length > 0 ? (
                <div className="w-full pr-4">{messages[messages.length - 1].content}</div>
              ) : (
                <span className="text-gray-400">Loading tutorial...</span>
              )}
            </div>
            
            {/* Player input area - only shown when it's the player's turn to respond */}
            {messages.length > 0 && 
             responseCount < MAX_RESPONSES &&
             (messages[messages.length - 1].role === 'system' && 
              (messages[messages.length - 1].content.includes("Try saying") || 
               messages[messages.length - 1].content.includes("try questioning") || 
               messages[messages.length - 1].content.includes("mention the security") ||
               messages[messages.length - 1].content.includes("For your") ||
               messages[messages.length - 1].content.includes("Good!"))) && (
              <div className="player-input absolute bottom-40 left-6 right-6 transition-opacity duration-300">
                <form onSubmit={handlePlayerInput} className="flex items-center">
          <input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
                    placeholder="Enter your response..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 text-black"
            disabled={responseCount >= MAX_RESPONSES}
          />
                  <div className="ml-2">
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
                  </div>
        </form>
              </div>
            )}
            
            {/* Manual Next button for dialogue advancement - hide when it's player's turn */}
            {messages.length > 0 && !['player'].includes(messages[messages.length - 1].role) && 
             (messageQueue.length > 0 || // Always show Next when there are queued messages
              isReadyForVerdict || // Always show Next when ready for verdict
              (messageQueue.length === 0 && 
              !(messages[messages.length - 1].role === 'system' && 
                (messages[messages.length - 1].content.includes("Try saying") || 
                messages[messages.length - 1].content.includes("try questioning") || 
                messages[messages.length - 1].content.includes("mention the security") ||
                messages[messages.length - 1].content.includes("For your") ||
                messages[messages.length - 1].content.includes("Good!"))))) && (
              <div className="next-button-container absolute right-6 bottom-40">
                <button 
                  className="next-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg transition-colors flex items-center"
                  onClick={advanceDialogue}
                >
                  {isReadyForVerdict ? "Show Verdict" : "Next"}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 