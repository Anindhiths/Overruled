"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useScaffoldWriteContract, useScaffoldReadContract, useScaffoldContract } from "~~/hooks/scaffold-eth";
import { AIService } from "~~/services/ai";
import { VerdictPopup } from "./VerdictPopup";
import { CaseInfo } from "./CaseInfo";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";

interface Message {
  role: "player" | "judge" | "opponent" | "witness" | "system";
  content: string;
  timestamp: Date;
}

interface RandomCaseProps {
  onComplete: (won: boolean) => void;
}

interface CaseTemplate {
  title: string;
  description: string;
  keyPoints: string[];
}

// Dynamic case generation elements
const CASE_SUBJECTS = [
  "Corporate", "Environmental", "Copyright", "Patent", "Medical", "Cybersecurity", 
  "Privacy", "Employment", "Financial", "Insurance", "Real Estate", "Constitutional",
  "Criminal", "Family", "Immigration", "Tax", "Antitrust", "Consumer Protection"
];

// Add humorous case subjects
const FUNNY_CASE_SUBJECTS = [
  "Pizza Topping", "Coffee Spill", "Sock Disappearance", "Parking Spot", "Alien Abduction",
  "Time Travel", "Sandwich Theft", "Pet Psychic", "Garden Gnome", "Dating App", "Reality TV",
  "Smart Home", "Social Media", "Viral Dance", "Emoji Usage", "Video Game", "Dad Joke"
];

const CASE_TYPES = [
  "Dispute", "Violation", "Infringement", "Fraud", "Negligence", "Breach of Contract",
  "Lawsuit", "Malpractice", "Misrepresentation", "Discrimination", "Harassment",
  "Liability", "Conspiracy", "Theft", "Corruption", "Defamation"
];

// Add humorous case types
const FUNNY_CASE_TYPES = [
  "Mishap", "Misunderstanding", "Mix-up", "Conspiracy", "Prank Gone Wrong", "Absurd Claim", 
  "Ridiculous Lawsuit", "Bizarre Incident", "Outlandish Accusation", "Hilarious Disagreement",
  "Preposterous Allegation", "Comical Dispute", "Wacky Incident", "Bewildering Situation"
];

const COMPANIES = [
  "TechCorp", "GlobalIndustries", "MegaSystems", "InnovateX", "FutureTech",
  "OmniCorp", "VisionaryLabs", "PrimeSolutions", "ApexCorporation", "NexGen",
  "QuantumWorks", "Stellaris", "CyberDyne", "EcoSystems", "MediTrust"
];

// Add humorous company names
const FUNNY_COMPANIES = [
  "Nap Industries", "Procrastination Inc.", "Meme Factory", "Snack Attack Ltd.", 
  "Coffee Addicts Anonymous", "Awkward Moments LLC", "Couch Potato Enterprises", 
  "Monday Haters Co.", "Bad Dad Jokes Inc.", "Pizza Perfectionists", "Totally Legit Business",
  "Not A Scam Corp", "Definitely Real Company", "Pajama Professionals", "WiFi Password Wizards"
];

const PLAINTIFF_DESCRIPTORS = [
  "former employee", "competitor", "regulatory agency", "customer", "investor",
  "contractor", "partner company", "whistleblower", "government entity", "consumer group"
];

// Add humorous plaintiff descriptors
const FUNNY_PLAINTIFF_DESCRIPTORS = [
  "disgruntled cat owner", "amateur comedian", "confused grandparent", "neighborhood BBQ champion",
  "self-proclaimed psychic", "conspiracy theorist", "social media influencer", "reality TV contestant",
  "local superhero impersonator", "passionate food critic", "aspiring novelist", "retired mime artist",
  "competitive dog groomer", "professional napper", "extreme coupon collector"
];

const EVIDENCE_TYPES = [
  "emails", "witness testimony", "digital records", "financial documents", "surveillance footage",
  "expert analysis", "physical evidence", "DNA samples", "audit findings", "social media posts",
  "confidential documents", "transaction history", "contracts", "medical records"
];

// Add humorous evidence types
const FUNNY_EVIDENCE_TYPES = [
  "blurry selfies", "handwritten sticky notes", "memes", "interpretive dance videos", 
  "badly drawn diagrams", "fortune cookie predictions", "dream journal entries",
  "questionable online reviews", "karaoke performance recordings", "AI-generated artwork",
  "grocery lists", "text messages sent at 3 AM", "horoscope readings", "TikTok videos"
];

const KEY_POINT_STARTERS = [
  "The evidence was collected improperly",
  "There are conflicting testimonies about",
  "A key witness has changed their story about",
  "The plaintiff has a history of",
  "Industry standards allow for",
  "Recent precedent suggests",
  "Technical experts disagree about",
  "Documentation shows that",
  "The timing of events indicates",
  "Financial records reveal",
  "Similar cases have been dismissed due to",
  "The agreement explicitly states",
  "Independent verification confirms",
  "Statistical analysis suggests",
  "Regulatory compliance was maintained regarding"
];

// Add a constant for witness images at the top level with other constants
const WITNESS_IMAGES = ["witness_1", "witness_2", "witness_3", "witness_4", "witness_5", "witness_6"];

// Add personality types for characters
const JUDGE_PERSONALITIES = [
  {
    type: "Coffee Addict",
    intro: "     *sips coffee* Ahem... Court is now in session. Let's try to keep this interesting, I'm only on my fourth espresso.",
    traits: "Energetic, occasionally jittery, makes coffee-related comments"
  },
  {
    type: "Dad Joke Enthusiast",
    intro: "     Order in the court! And no, I don't mean takeout. Let's proceed with the case.",
    traits: "Loves puns, makes legal-themed dad jokes"
  },
  {
    type: "Tech Savvy",
    intro: "      *checking smartwatch* According to my AI assistant, we're ready to begin. Please ensure your devices are on silent mode.",
    traits: "References technology, uses modern slang"
  },
  {
    type: "Old School",
    intro: "       Back in my day, we didn't have all these fancy presentations. But let's see what we have here...",
    traits: "Makes historical references, slightly behind on technology"
  }
];

const PROSECUTOR_PERSONALITIES = [
  {
    type: "Drama Queen",
    intro: "     *adjusts tie dramatically* Your Honor, prepare yourself for the most SHOCKING evidence you've ever seen!",
    traits: "Overly theatrical, loves dramatic pauses"
  },
  {
    type: "Perfectionist",
    intro: "    Your Honor, I have organized this case into precisely 37 color-coded sections with cross-referenced tabs.",
    traits: "Obsessed with details, slightly neurotic"
  },
  {
    type: "Rookie",
    intro: "     *dropping papers* Oh! Sorry, Your Honor! I mean... The prosecution is totally ready to proceed!",
    traits: "Enthusiastic but clumsy, tries too hard"
  },
  {
    type: "Conspiracy Theorist",
    intro: "     Your Honor, this case goes deeper than anyone could imagine. The evidence will reveal connections you never saw coming!",
    traits: "Sees connections everywhere, slightly paranoid"
  }
];

const WITNESS_PERSONALITIES = [
  {
    type: "Social Media Influencer",
    intro: "     Like, I totally saw everything! Should I do a TikTok about this?",
    traits: "Uses internet slang, constantly references followers"
  },
  {
    type: "Retired Superhero",
    intro: "     In all my years of fighting cr- I mean, observing citizens, I've never seen anything like this.",
    traits: "Makes subtle superhero references, overly dramatic"
  },
  {
    type: "Conspiracy Expert",
    intro: "     First, we need to establish that the earth is fl- oh, right, the case. Yes, I witnessed everything.",
    traits: "Questions everything, has wild theories"
  },
  {
    type: "Time Traveler",
    intro: "     I saw it all happen... or will see it happen? Time is relative, Your Honor.",
    traits: "Confused about timeline, makes future references"
  }
];

// Generate a unique random case
const generateRandomCase = (): CaseTemplate => {
  // Decide if this should be a funny case (30% chance)
  const isHumorousCase = Math.random() < 0.3;
  
  const subject = isHumorousCase 
    ? FUNNY_CASE_SUBJECTS[Math.floor(Math.random() * FUNNY_CASE_SUBJECTS.length)]
    : CASE_SUBJECTS[Math.floor(Math.random() * CASE_SUBJECTS.length)];
    
  const caseType = isHumorousCase
    ? FUNNY_CASE_TYPES[Math.floor(Math.random() * FUNNY_CASE_TYPES.length)]
    : CASE_TYPES[Math.floor(Math.random() * CASE_TYPES.length)];
    
  const company = isHumorousCase
    ? FUNNY_COMPANIES[Math.floor(Math.random() * FUNNY_COMPANIES.length)]
    : COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    
  const plaintiff = isHumorousCase
    ? FUNNY_PLAINTIFF_DESCRIPTORS[Math.floor(Math.random() * FUNNY_PLAINTIFF_DESCRIPTORS.length)]
    : PLAINTIFF_DESCRIPTORS[Math.floor(Math.random() * PLAINTIFF_DESCRIPTORS.length)];
    
  const evidenceType1 = isHumorousCase
    ? FUNNY_EVIDENCE_TYPES[Math.floor(Math.random() * FUNNY_EVIDENCE_TYPES.length)]
    : EVIDENCE_TYPES[Math.floor(Math.random() * EVIDENCE_TYPES.length)];
    
  const evidenceType2 = isHumorousCase
    ? FUNNY_EVIDENCE_TYPES[Math.floor(Math.random() * FUNNY_EVIDENCE_TYPES.length)]
    : EVIDENCE_TYPES[Math.floor(Math.random() * EVIDENCE_TYPES.length)];
  
  // Ensure evidence types are different
  const evidence = evidenceType1 === evidenceType2 
    ? evidenceType1 
    : `${evidenceType1} and ${evidenceType2}`;
  
  // Generate a random amount of money or percentage for disputes
  const amount = Math.floor(Math.random() * 900) + 100; // 100-999
  const percentage = Math.floor(Math.random() * 30) + 5; // 5-35%
  const year = 2015 + Math.floor(Math.random() * 8); // 2015-2023
  
  // Create title
  const title = `The ${subject} ${caseType} Case`;
  
  // Create description with randomized elements
  let descriptionTemplates = [];
  
  if (isHumorousCase) {
    descriptionTemplates = [
      `You are defending ${company}'s ${plaintiff}, who is accused of a ${caseType.toLowerCase()} involving ${subject.toLowerCase()} choices. The prosecution has ${evidence} as supposed proof, claiming damages of $${amount}.`,
      `You are the defense attorney for ${company}, facing a ${subject.toLowerCase()} ${caseType.toLowerCase()} claim from a ${plaintiff}. They allege an incident occurred in ${year} and have presented ${evidence} as "evidence."`,
      `You are defending ${company} against a ${subject.toLowerCase()} dispute brought by a ${plaintiff}, who claims ${percentage}% emotional distress due to the alleged ${caseType.toLowerCase()}. They've dramatically presented ${evidence} to support their case.`,
      `As defense counsel for ${company}, you must counter a ${subject.toLowerCase()} ${caseType.toLowerCase()} allegation. The ${plaintiff} has gathered ${evidence} and is demanding compensation in the form of free pizza for life.`
    ];
  } else {
    descriptionTemplates = [
      `You are defending ${company}'s ${plaintiff}, who is accused of ${caseType.toLowerCase()} involving ${subject.toLowerCase()} matters. The prosecution has ${evidence} against your client, claiming damages of $${amount}M.`,
      `As defense counsel for ${company}, you face a ${subject.toLowerCase()} ${caseType.toLowerCase()} claim from a ${plaintiff}. They allege misconduct occurred in ${year} and have presented ${evidence} as proof.`,
      `You are defending ${company} in a ${subject.toLowerCase()} dispute where a ${plaintiff} claims ${percentage}% loss due to alleged ${caseType.toLowerCase()}. They've produced ${evidence} to support their case.`,
      `As the defense attorney, you represent ${company} against a ${subject.toLowerCase()} ${caseType.toLowerCase()} allegation. The ${plaintiff} has gathered ${evidence} and is seeking significant penalties.`
    ];
  }
  
  // Get description and ensure correct spelling
  let description = descriptionTemplates[Math.floor(Math.random() * descriptionTemplates.length)];
  
  // Ensure no spelling errors in description
  description = description
    .replace(/\bYur\b/g, "Your")
    .replace(/\byur\b/g, "your")
    .replace(/\bHonr\b/g, "Honor")
    .replace(/\bhonr\b/g, "honor");
  
  // Generate 4-5 unique key points
  const usedPointIndices = new Set<number>();
  const keyPoints: string[] = [];
  
  // Determine number of key points (4-5)
  const numKeyPoints = Math.random() < 0.7 ? 4 : 5;
  
  // Add humorous key point starters
  const HUMOROUS_KEY_POINT_STARTERS = [
    "The so-called evidence was collected while eating pizza",
    "The plaintiff's story changes depending on their caffeine intake",
    "Nobody can agree on what actually happened because",
    "The entire situation could have been avoided if someone had just",
    "There's a conspiracy theory about",
    "The alleged incident happened after a marathon of reality TV about",
    "Witnesses were distracted by a cute dog during",
    "The social media posts in question were made at 2 AM after",
    "The plaintiff has a history of exaggerating about",
    "The timing suspiciously coincides with the release of a new smartphone"
  ];
  
  const useKeyPointStarters = isHumorousCase ? HUMOROUS_KEY_POINT_STARTERS : KEY_POINT_STARTERS;
  
  while (keyPoints.length < numKeyPoints) {
    // Get a random starter that hasn't been used yet
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * useKeyPointStarters.length);
    } while (usedPointIndices.has(randomIndex));
    
    usedPointIndices.add(randomIndex);
    const starter = useKeyPointStarters[randomIndex];
    
    // Add random elements to complete the key point
    const seriousKeyPointElements = [
      ` the ${subject.toLowerCase()} practices`,
      ` the timing of the alleged ${caseType.toLowerCase()}`,
      ` similar incidents at competitor companies`,
      ` ${company}'s compliance history`,
      ` the credibility of the ${plaintiff}`,
      ` industry standard practices`,
      ` the interpretation of relevant laws`,
      ` previous settlements in similar cases`,
      ` the damages calculation methodology`,
      ` the chain of custody for ${evidence}`,
      ` potential motivations for false claims`
    ];
    
    // Add humorous key point endings
    const humorousKeyPointElements = [
      ` the ${subject.toLowerCase()} preferences of local celebrities`,
      ` the coffee consumption habits of the entire office`,
      ` whether pineapple belongs on pizza (it's relevant, trust us)`,
      ` ${company}'s bizarre office party traditions`,
      ` the ${plaintiff}'s TikTok dance abilities`,
      ` an office-wide debate about proper sandwich cutting techniques`,
      ` the interpretation of emoji usage in company communications`,
      ` who really stole the last donut from the break room`,
      ` the alleged "curse" of the office printer`,
      ` whether the evidence was actually just an elaborate prank`,
      ` how many employees actually read the terms and conditions`
    ];
    
    const keyPointElements = isHumorousCase ? humorousKeyPointElements : seriousKeyPointElements;
    const element = keyPointElements[Math.floor(Math.random() * keyPointElements.length)];
    let keyPoint = starter + element;
    
    // Ensure no spelling errors in key points
    keyPoint = keyPoint
      .replace(/\bYur\b/g, "Your")
      .replace(/\byur\b/g, "your")
      .replace(/\bHonr\b/g, "Honor")
      .replace(/\bhonr\b/g, "honor");
    
    keyPoints.push(keyPoint);
  }
  
  return {
    title,
    description,
    keyPoints
  };
};

const CASE_TEMPLATES: CaseTemplate[] = [
  // ... existing case templates stay as fallback ...
];

const GAME_SETTINGS = {
  maxResponses: 5,
  scoreToWin: 2
};

// Add a function to handle Groq voice transcription and browser fallback
const transcribeAudioWithGroq = async (audioBlob: Blob): Promise<string> => {
  try {
    // Create FormData to send the audio
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    console.log("Sending audio for transcription, size:", audioBlob.size, "bytes");
    
    // Send to a serverless function that handles the Groq API call
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Transcription API error:', response.status, errorData);
      throw new Error(`Transcription failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Transcription result:", data);
    return data.text || "";
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return "";
  }
};

// TypewriterText component for text animation
const TypewriterText = ({ text, speed = 15 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const index = useRef(0);
  
  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    index.current = 0;
    setIsComplete(false);
    
    // Ensure text is defined and not null or undefined
    const processedText = text || "";
    
    // Start the typewriter effect
    const timer = setInterval(() => {
      if (index.current < processedText.length) {
        setDisplayedText(prev => prev + processedText.charAt(index.current));
        index.current += 1;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  // Click to instantly show full text
  const showFullText = () => {
    if (!isComplete) {
      // Ensure the text is defined and not null or undefined
      const processedText = text || "";
      setDisplayedText(processedText);
      setIsComplete(true);
    }
  };
  
  return (
    <div 
      onClick={showFullText} 
      style={{ cursor: isComplete ? 'default' : 'pointer' }}
      className="whitespace-pre-wrap"
    >
      {displayedText}
      {!isComplete && <span className="animate-blink-cursor text-xl">▌</span>}
    </div>
  );
};

// Add dynamic intro generators before initializeCase
const generateJudgeIntro = (caseTitle: string) => {
  const intros = [
    `     *adjusts glasses* Court is now in session for ${caseTitle}. Let's proceed with decorum.`,
    `     *taps gavel* The court will now hear arguments regarding ${caseTitle}.`,
    `     *shuffles papers* We're here today to examine the merits of ${caseTitle}. Let's begin.`,
    `     *checks watch* The court's time is valuable, so let's dive into ${caseTitle}.`,
    `     *sips water* This court is now in session. We'll be hearing ${caseTitle} today.`,
    `     *straightens robe* The court recognizes the gravity of ${caseTitle}. Proceed.`
  ];
  return intros[Math.floor(Math.random() * intros.length)];
};

const generateProsecutorIntro = (caseDescription: string) => {
  const intros = [
    `     Your Honor, we have compelling evidence including ${caseDescription.includes('evidence') ? caseDescription.split('evidence').pop()?.split('.')[0] : 'key documents and testimony'} that will prove our case.`,
    `     *arranges documents* The prosecution presents ${caseDescription.includes('evidence') ? caseDescription.split('evidence').pop()?.split('.')[0] : 'critical evidence'} that demonstrates the defendant's culpability.`,
    `     *steps forward* Your Honor, our evidence consists of ${caseDescription.includes('evidence') ? caseDescription.split('evidence').pop()?.split('.')[0] : 'multiple witness accounts and documentation'} that will establish guilt.`,
    `     We have gathered substantial proof, including ${caseDescription.includes('evidence') ? caseDescription.split('evidence').pop()?.split('.')[0] : 'key testimonies and records'}, to support these allegations.`,
    `     *opens briefcase* The prosecution will present ${caseDescription.includes('evidence') ? caseDescription.split('evidence').pop()?.split('.')[0] : 'conclusive evidence'} that leaves no room for doubt.`,
    `     *stands confidently* Our evidence, which includes ${caseDescription.includes('evidence') ? caseDescription.split('evidence').pop()?.split('.')[0] : 'critical documentation and witness statements'}, will prove these charges.`
  ];
  return intros[Math.floor(Math.random() * intros.length)];
};

// Move useSpeechRecognitionFallback outside of toggleVoiceInput
const useSpeechRecognitionFallback = (
  speechRecognitionRef: React.MutableRefObject<any>,
  setIsListening: (value: boolean) => void,
  setRecordingState: React.Dispatch<React.SetStateAction<'idle' | 'recording' | 'processing'>>
) => {
  if (speechRecognitionRef.current) {
    try {
      speechRecognitionRef.current.start();
      setIsListening(true);
      setRecordingState('recording');
      
      toast('Listening (browser recognition)...', { 
        icon: '🎤', 
        duration: 2000,
        position: 'bottom-center',
        style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
      });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setRecordingState('idle');
      toast('Voice recognition failed. Please try again.', {
        icon: '🎤',
        duration: 2000,
        position: 'bottom-center',
        style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
      });
    }
  }
};

export const RandomCase = ({ onComplete }: RandomCaseProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [playerInput, setPlayerInput] = useState("");
  const [newResponseCount, setNewResponseCount] = useState(0);
  const [currentCase, setCurrentCase] = useState(generateRandomCase());
  const [gameState, setGameState] = useState({
    playerScore: 0,
    opponentScore: 0,
  });
  const [showVerdict, setShowVerdict] = useState(false);
  const [verdictIsWin, setVerdictIsWin] = useState(false);
  const [isBadArgument, setIsBadArgument] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [currentWitnessImage, setCurrentWitnessImage] = useState<string>("");
  const [hasPendingMessages, setHasPendingMessages] = useState(false);

  const [isNewMessage, setIsNewMessage] = useState(false);
  const [isPoorPerformance, setIsPoorPerformance] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCaseInfo, setShowCaseInfo] = useState(false);
  const [messageDelay, setMessageDelay] = useState(4000); // Keep for future use if needed

  // Voice input states - with better browser support
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'processing'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const aiService = AIService.getInstance();
  const requiredScore = GAME_SETTINGS.scoreToWin;

  const { data: gameContract } = useScaffoldContract({
    contractName: "LegalGame",
  });

  const { data: owner } = useScaffoldReadContract({
    contractName: "LegalGame",
    functionName: "owner",
  });

  const { writeContractAsync: recordWinAsync } = useScaffoldWriteContract({
    contractName: "LegalGame",
  });

  const { writeContractAsync: recordLossAsync } = useScaffoldWriteContract({
    contractName: "LegalGame",
  });

  const { data: caseInfo } = useScaffoldReadContract({
    contractName: "LegalGame",
    functionName: "getCase",
    args: [BigInt(0)],
  });

  // Add a new state for message queue
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);

  // Add a new state to track when a final verdict has been issued but not yet shown
  const [pendingVerdict, setPendingVerdict] = useState<boolean>(false);
  const [verdictOutcome, setVerdictOutcome] = useState<boolean>(false);

  // Add a new state for triggering auto verdict popup
  const [autoShowVerdictTimer, setAutoShowVerdictTimer] = useState<NodeJS.Timeout | null>(null);

  // Add a new state for tracking the final verdict status
  const [hasFinalVerdict, setHasFinalVerdict] = useState<boolean>(false);
  const [finalVerdictOutcome, setFinalVerdictOutcome] = useState<'win' | 'loss' | null>(null);

  // Modify initializeCase to use personalities
  const initializeCase = async () => {
    try {
      const generatedCase = generateRandomCase();
      setCurrentCase(generatedCase);

      const randomWitnessImage = WITNESS_IMAGES[Math.floor(Math.random() * WITNESS_IMAGES.length)];
      setCurrentWitnessImage(`/images/characters/${randomWitnessImage}.png`);

      setIsPoorPerformance(true);
      
      // Generate dynamic intros based on case context
      const judgeIntro = generateJudgeIntro(generatedCase.title);
      const prosecutorIntro = generateProsecutorIntro(generatedCase.description);
      
      const initialMessageQueue: Message[] = [
        {
          role: "judge",
          content: judgeIntro,
          timestamp: new Date(),
        },
        {
          role: "system",
          content: ` ${generatedCase.description}`,
          timestamp: new Date(),
        },
        {
          role: "opponent",
          content: prosecutorIntro,
          timestamp: new Date(),
        }
      ];
      
      setMessages([initialMessageQueue[0]]);
      setMessageQueue(initialMessageQueue.slice(1));
      
      setIsPoorPerformance(false);
      setIsInitialized(true);
    } catch (error) {
      console.error("Error creating case:", error);
      setIsPoorPerformance(false);
    }
  };

  // Initialize the case when the component mounts
  useEffect(() => {
    if (!isInitialized) {
      initializeCase();
    }
  }, [isInitialized]);

  // Set new message animation
  useEffect(() => {
    if (messages.length > 0) {
      setIsNewMessage(true);
      setTimeout(() => setIsNewMessage(false), 1000);
    }
  }, [messages]);

  // Debug logging
  useEffect(() => {
    console.log("Current case:", currentCase);
    console.log("Show info:", showInfo);
  }, [currentCase, showInfo]);

  // Initialize audio recording and speech recognition capabilities
  useEffect(() => {
    // Check browser compatibility
    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasMediaRecorder = typeof window !== 'undefined' && navigator.mediaDevices && 'MediaRecorder' in window;
    
    console.log('Speech recognition available:', hasSpeechRecognition);
    console.log('Media recorder available:', hasMediaRecorder);
    
    if (hasMediaRecorder || hasSpeechRecognition) {
      setVoiceSupported(true);
      
      // Initialize browser's speech recognition as fallback
      if (hasSpeechRecognition) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setPlayerInput(prev => prev + ' ' + transcript.trim());
          setRecordingState('idle');
          
          toast.success('Voice captured', {
            icon: '🎤',
            duration: 1500,
            position: 'bottom-center',
            style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
          });
        };
        
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setRecordingState('idle');
          
          toast('Voice recognition error. Try again.', {
            icon: '🎤',
            duration: 2000,
            position: 'bottom-center',
            style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
          });
        };
        
        recognition.onend = () => {
          setIsListening(false);
          setRecordingState('idle');
        };
        
        speechRecognitionRef.current = recognition;
      }
    } else {
      console.warn('Audio recording not supported in this browser');
      setVoiceSupported(false);
    }
    
    // Cleanup
    return () => {
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error('Error stopping media recorder:', e);
        }
      }
    };
  }, []);

  // Update toggleVoiceInput to use the moved function
  const toggleVoiceInput = useCallback(() => {
    if (!voiceSupported || isPoorPerformance) return;
    
    if (isListening) {
      setRecordingState('processing');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.error('Error stopping recording:', e);
          setRecordingState('idle');
        }
      }
      
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
          setRecordingState('idle');
        }
      }
    } else {
      if (typeof window !== 'undefined' && navigator.mediaDevices && 'MediaRecorder' in window) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            try {
              const options = { 
                mimeType: MediaRecorder.isTypeSupported('audio/webm') 
                  ? 'audio/webm' 
                  : 'audio/mp4'
              };
              
              const mediaRecorder = new MediaRecorder(stream, options);
              mediaRecorderRef.current = mediaRecorder;
              audioChunksRef.current = [];
              
              mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
                }
              };
              
              mediaRecorder.onstop = async () => {
                setIsListening(false);
                setRecordingState('processing');
                
                try {
                  const audioBlob = new Blob(audioChunksRef.current, { 
                    type: mediaRecorder.mimeType 
                  });
                  
                  if (audioBlob.size < 1000) {
                    toast('No speech detected. Try again.', { 
                      icon: '🎤', 
                      duration: 2000, 
                      position: 'bottom-center',
                      style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
                    });
                    setRecordingState('idle');
                    return;
                  }
                  
                  const transcript = await transcribeAudioWithGroq(audioBlob);
                  
                  if (transcript && transcript.trim()) {
                    setPlayerInput(prev => prev + ' ' + transcript.trim());
                    toast.success('Voice captured', { 
                      icon: '🎤', 
                      duration: 1500, 
                      position: 'bottom-center',
                      style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
                    });
                  } else {
                    toast('Voice unclear. Try again.', {
                      icon: '🎤',
                      duration: 2000,
                      position: 'bottom-center',
                      style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
                    });
                  }
                } catch (error) {
                  console.error('Error processing voice input:', error);
                  toast('Voice detection issue. Try again.', {
                    icon: '🎤',
                    duration: 2000,
                    position: 'bottom-center',
                    style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
                  });
                } finally {
                  stream.getTracks().forEach(track => track.stop());
                  setRecordingState('idle');
                }
              };
              
              mediaRecorder.start(1000);
              setIsListening(true);
              setRecordingState('recording');
              
              toast('Listening...', { 
                icon: '🎤', 
                duration: 2000,
                position: 'bottom-center',
                style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
              });
            } catch (error) {
              console.error('Error initializing MediaRecorder:', error);
              useSpeechRecognitionFallback(speechRecognitionRef, setIsListening, setRecordingState);
            }
          })
          .catch(error => {
            console.error('Error accessing microphone:', error);
            
            if (speechRecognitionRef.current) {
              useSpeechRecognitionFallback(speechRecognitionRef, setIsListening, setRecordingState);
            } else {
              toast('Microphone access needed.', {
                icon: '🎤',
                duration: 2000,
                position: 'bottom-center',
                style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
              });
              setRecordingState('idle');
            }
          });
      } else if (speechRecognitionRef.current) {
        useSpeechRecognitionFallback(speechRecognitionRef, setIsListening, setRecordingState);
      }
    }
  }, [isListening, voiceSupported, isPoorPerformance]);

  // Add keyboard shortcut for voice input (press 'v' key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === 'v' && voiceSupported && !isPoorPerformance) {
        toggleVoiceInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleVoiceInput, voiceSupported, isPoorPerformance]);

  const handleCaseEnd = async (hasWon: boolean) => {
    try {
      // Log the result with checkmark emoji
      console.log(`✅ ${hasWon ? 'Win' : 'Loss'} recorded successfully on blockchain`);
      
      // Show a toast notification with checkmark
      toast.success(`✅ ${hasWon ? 'Win' : 'Loss'} recorded successfully on blockchain`, {
        duration: 2000,
        position: 'bottom-center',
        style: { background: '#f3f4f6', color: '#374151', fontSize: '0.875rem' }
      });
      
      // Proceed to score page
      onComplete(hasWon);
    } catch (error: any) {
      console.error("Error handling case end:", error);
      // Still complete the game even if there's an error
      onComplete(hasWon);
    }
  };

  // Modify the advanceDialogue function to immediately redirect to score page when judge gives verdict
  const advanceDialogue = () => {
    if (messageQueue.length > 0 && !isPoorPerformance) {
      // Take the next message from the queue
      const nextMessage = messageQueue[0];
      
      // Add it to displayed messages
      setMessages(prev => [...prev, nextMessage]);
      
      // Remove it from the queue
      setMessageQueue(prev => {
        const newQueue = prev.slice(1);
        // Update hasPendingMessages based on queue state
        setHasPendingMessages(newQueue.length > 0);
        return newQueue;
      });

      // Check if this is the final verdict message
      const isFinalJudgeVerdict = nextMessage.role === "judge" && 
        (nextMessage.content.includes("Based on the evidence presented, I find") || 
         nextMessage.content.includes("Time has expired"));
      
      // If it's the final verdict message, set the verdict indicator after a delay
      if (isFinalJudgeVerdict) {
        const hasWon = nextMessage.content.includes("in favor of the defense") || 
                      nextMessage.content.includes("Case dismissed");
        
        // Clear any existing auto-show timer if it exists
        if (autoShowVerdictTimer) {
          clearTimeout(autoShowVerdictTimer);
          setAutoShowVerdictTimer(null);
        }

        // Set a 7-second delay before showing the verdict
        const timer = setTimeout(() => {
          setHasFinalVerdict(true);
          setFinalVerdictOutcome(hasWon ? 'win' : 'loss');
        }, 7000); // 7 seconds delay
        
        setAutoShowVerdictTimer(timer);
      }
    } else if (pendingVerdict) {
      // For backward compatibility, just in case we still have pending verdicts
      handleCaseEnd(verdictOutcome);
      setPendingVerdict(false);
    }
  };

  // Add effect to cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoShowVerdictTimer) {
        clearTimeout(autoShowVerdictTimer);
      }
    };
  }, [autoShowVerdictTimer]);

  // Modify handlePlayerInput to update final verdict handling
  const handlePlayerInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerInput.trim() || isPoorPerformance) return;

    // Start animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    // Fix the variable redeclaration issue by using a different variable name
    const updatedResponseCount = newResponseCount + 1;
    setNewResponseCount(updatedResponseCount);

    // Skip adding player's message to visible messages
    const playerMessage: Message = {
      role: "player",
      content: playerInput,
      timestamp: new Date(),
    };
    
    // Clear input field
    setPlayerInput("");

    try {
      // Start loading state
      setIsPoorPerformance(true);
      
      // Initialize new message queue for AI responses
      const newMessageQueue: Message[] = [];
      
      // Check if player used provocative language to generate emotional responses
      const hasProvocativeLanguage = playerInput.toLowerCase().match(/ridiculous|absurd|incompetent|unprofessional|bad|wrong|no evidence|terrible|weak|pathetic/i) !== null;
      const hasStrongEvidence = playerInput.toLowerCase().match(/evidence clearly shows|proof is|as demonstrated by|witness testimony confirms|documents prove|records indicate|exhibit shows|precedent establishes/i) !== null;
      
      // Customize grammar note with emotional guidance based on player's message
      let emotionalGuidance = "";
      if (hasProvocativeLanguage) {
        emotionalGuidance = "The player is being confrontational. Please respond with an angry, defensive tone. Use words that show frustration or indignation while remaining professional.";
      } else if (hasStrongEvidence) {
        emotionalGuidance = "The player has presented strong evidence. If their argument is compelling, show concern in your response. If their evidence has flaws, respond with confidence and slight smugness.";
      } else if (gameState.playerScore > (requiredScore * 0.7)) {
        emotionalGuidance = "The player is winning the case. Show some frustration and urgency in your response.";
      } else if (updatedResponseCount > GAME_SETTINGS.maxResponses * 0.7) {
        emotionalGuidance = "The case is nearing its end. If the player is losing, show confidence and satisfaction in your response.";
      }
      
      // Grammar note with emotional guidance
      const grammarNote = `Please ensure your response is grammatically correct and well-structured with proper sentences and punctuation. ${emotionalGuidance}`;
      
      // Get opponent response first
      console.log("Getting opponent response...");
      const opponentResponse = await aiService.generateOpponentResponse(`${playerInput}\n\n${grammarNote}`);
      
      // Add the opponent response to the queue
      newMessageQueue.push({
            role: "opponent",
        content: " " + opponentResponse,
            timestamp: new Date(),
      });

      // Wait a moment to avoid rate limiting (if needed)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Next get judge response
      console.log("Getting judge response...");
          const judgeResponse = await aiService.generateJudgeResponse(`${playerInput}\n\n${grammarNote}`);
          const judgeResponseLower = judgeResponse.toLowerCase();
          
      // Add the judge response to the queue
      newMessageQueue.push({
              role: "judge",
        content: " " + judgeResponse,
              timestamp: new Date(),
      });
      
      // Randomly decide if we should add a witness
      const shouldAddWitness = Math.random() < 0.3;
          if (shouldAddWitness) {
        console.log("Getting witness response...");
        // Wait a moment to avoid rate limiting (if needed)
        await new Promise(resolve => setTimeout(resolve, 500));
        
              const witnessRoles = ["expert", "eyewitness", "character", "forensic"];
              const randomRole = witnessRoles[Math.floor(Math.random() * witnessRoles.length)];
              
              // Get witness response
              const witnessResponse = await aiService.generateWitnessResponse(`${playerInput}\n\n${grammarNote}`, randomRole);
              
        // Add the witness response to the queue
        newMessageQueue.push({
                  role: "witness",
          content: " " + witnessResponse,
                  timestamp: new Date(),
        });
      }
      
      console.log("All responses obtained:", newMessageQueue);
      
      // Evaluate argument quality based on judge's response and player input
      const isBadArg = evaluateArgumentQuality(playerInput, judgeResponseLower);
          
      // Update game state
      const newState = updateGameState(playerInput, judgeResponse);
          
      // Check for end of game
      if (newState.playerScore >= requiredScore || updatedResponseCount >= GAME_SETTINGS.maxResponses) {
        // Add final judgment message
        const finalVerdict = newState.playerScore >= requiredScore 
          ? {
              role: "judge" as const,
              content: " Based on the evidence presented, I find in favor of the defense. Case dismissed!",
              timestamp: new Date(),
            }
          : {
              role: "judge" as const,
              content: " Time has expired. Based on the evidence presented, I find in favor of the prosecution.",
              timestamp: new Date(),
            };
        
        newMessageQueue.push(finalVerdict);
        
        // No need to set auto timer - we'll let the user click Next
        const hasWon = newState.playerScore >= requiredScore;
        
        // Clear any existing auto-show timer if it exists
        if (autoShowVerdictTimer) {
          clearTimeout(autoShowVerdictTimer);
          setAutoShowVerdictTimer(null);
        }
      }
      
      // Show the first message from the queue immediately
      if (newMessageQueue.length > 0) {
        console.log("Displaying first message:", newMessageQueue[0]);
        setMessages(prev => [...prev, newMessageQueue[0]]);
        
        // Queue the rest of the messages
        if (newMessageQueue.length > 1) {
          setMessageQueue(newMessageQueue.slice(1));
          setHasPendingMessages(true);
        } else {
          setHasPendingMessages(false);
        }
      }
              
      // End loading state
      setIsPoorPerformance(false);
              
      // If this was the last response, remove auto-showing verdict
      if (newState.playerScore >= requiredScore || updatedResponseCount >= GAME_SETTINGS.maxResponses) {
        // Verdict will be shown after player clicks through all messages
      }
    } catch (error: any) {
      console.error("Error generating AI responses:", error);
      toast.error("Something went wrong. Please try again.");
      setIsPoorPerformance(false);
    }
  };

  const evaluateArgumentQuality = (playerInput: string, judgeResponse: string): boolean => {
    // Check for bad arguments based on various criteria
    const lowQualityMarkers = [
      // Lack of legal terminology
      !playerInput.match(/evidence|witness|testimony|exhibit|objection|precedent|statute|law|legal|court|judge|jury/i),

      // Very short arguments
      playerInput.length < 40, // Reduced from 50 to 40 characters

      // Irrelevant content
      playerInput.includes("irrelevant") && !playerInput.includes("not irrelevant"),

      // Aggressive or unprofessional language
      playerInput.match(/stupid|idiot|dumb|ridiculous|nonsense|garbage|trash|fool/i) !== null,

      // Judge's negative response indicators
      judgeResponse.toLowerCase().includes("irrelevant") ||
      judgeResponse.toLowerCase().includes("inappropriate") ||
      judgeResponse.toLowerCase().includes("insufficient") ||
      judgeResponse.toLowerCase().includes("lacks foundation"),
      
      // Additional strictness checks
      !playerInput.includes("Your Honor"), // Proper court address missing
      
      // Check for lack of coherent argument
      (playerInput.split(" ").length < 8), // Reduced from 10 to 8 words
      
      // Check for lack of relevance to the case
      !currentCase.keyPoints.some(point => 
        playerInput.toLowerCase().includes(point.toLowerCase().substring(0, 15))
      ),
      
      // Argumentative without legal basis
      playerInput.match(/obviously|clearly|definitely|undoubtedly/i) !== null && 
        !playerInput.match(/precedent|statute|law|regulation|code|ruling/i),
      
      // Emotional appeal without evidence
      playerInput.match(/unfair|unjust|morally wrong|offensive|shameful/i) !== null &&
        !playerInput.includes("evidence") && !playerInput.includes("exhibit")
    ];

    // If 4 or more quality issues are detected (increased from 3), consider it a bad argument
    const badArgsCount = lowQualityMarkers.filter(Boolean).length;
    return badArgsCount >= 4;  // Changed from 3 to 4
  };

  const updateGameState = (playerInput: string, judgeResponse: string) => {
    let playerScoreChange = 0;
    
    // Analyze the quality of the argument
    const isBadArgument = evaluateArgumentQuality(playerInput, judgeResponse);

    // Judge's specific responses carry most weight
    if (judgeResponse.toLowerCase().includes("overruled")) {
      playerScoreChange += 1;
    }
    if (judgeResponse.toLowerCase().includes("sustained")) {
      playerScoreChange -= 1;
    }
    
    // More ways to gain points
    // Give points for legal terminology and longer responses
    if (playerInput.length > 80 && // Reduced from 100 to 80 
        playerInput.match(/evidence|exhibit|precedent|statute|code section/i) &&
        !isBadArgument) {
      // Reward substantive, evidence-based arguments
      playerScoreChange += 1;
    }
    
    // Add a small bonus for proper court address
    if (playerInput.includes("Your Honor")) {
      playerScoreChange += 0.5; // Small bonus for proper court etiquette
    }
    
    // Add bonus for referencing case specifics
    if (currentCase.keyPoints.some(point => 
      playerInput.toLowerCase().includes(point.toLowerCase().substring(0, 15)))) {
      playerScoreChange += 0.5; // Bonus for referencing case specifics
    }
    
    // Make penalties less severe
    // Penalize poor arguments less heavily
    if (isBadArgument && playerScoreChange > 0) {
      playerScoreChange -= 0.5; // Reduced penalty from 1 to 0.5
    }

    // Check if argument cites specific evidence or legal principles
    const citesSpecifics = playerInput.match(/exhibit [a-z0-9]|section [0-9]|precedent in|pursuant to|according to the|as established in/i);
    if (citesSpecifics && !isBadArgument) {
      playerScoreChange += 1; // Bonus for specific citations
    }

    const newState = {
      ...gameState,
      playerScore: Math.max(0, Math.round(gameState.playerScore + playerScoreChange)),
    };

    setGameState(newState);
    return newState;
  };

  // Function to reset the game with a new case
  const resetWithNewCase = () => {
    const newCase = generateRandomCase();
    setCurrentCase(newCase);
    
    // Select a new random witness image for the new case
    const randomWitnessImage = WITNESS_IMAGES[Math.floor(Math.random() * WITNESS_IMAGES.length)];
    setCurrentWitnessImage(`/images/characters/${randomWitnessImage}.png`);
    
    setIsInitialized(false);
    setMessages([]);
    setNewResponseCount(0);
    setGameState({
      playerScore: 0,
      opponentScore: 0,
    });
    setShowVerdict(false);
    setIsBadArgument(false);
    setIsAnimating(false);
    setHasFinalVerdict(false);
    setFinalVerdictOutcome(null);
    
    // Clear any auto verdict timers
    if (autoShowVerdictTimer) {
      clearTimeout(autoShowVerdictTimer);
      setAutoShowVerdictTimer(null);
    }
  };

  // In the section where character images are determined
  const getCharacterImage = (role: string, message: string) => {
    if (role === "judge") {
      // Check if this is a losing verdict
      if (message.toLowerCase().includes("in favor of the prosecution") || 
          message.toLowerCase().includes("time has expired") ||
          message.toLowerCase().includes("case dismissed")) {
        return "/images/characters/judge_sad.png";
      }
      return "/images/characters/judge.png";
    }
    if (role === "opponent") {
      // Show ego prosecutor when they're being particularly confident or aggressive
      if (message.toLowerCase().includes("objection") ||
          message.toLowerCase().includes("your honor, with all due respect") ||
          message.toLowerCase().includes("irrelevant") ||
          message.toLowerCase().includes("misleading") ||
          message.toLowerCase().includes("ridiculous") ||
          message.toLowerCase().includes("absurd") ||
          message.toLowerCase().includes("preposterous") ||
          message.toLowerCase().includes("baseless")) {
        return "/images/characters/prosecutor_angry.png";
      }
      else if (message.toLowerCase().includes("evidence shows") ||
               message.toLowerCase().includes("clearly demonstrates") ||
               message.toLowerCase().includes("beyond reasonable doubt") ||
               message.toLowerCase().includes("proven") ||
               message.toLowerCase().includes("the facts are clear") ||
               message.toLowerCase().includes("as you can see") ||
               message.toLowerCase().includes("the evidence is overwhelming")) {
        return "/images/characters/prosecutor_happy.png";
      }
      else if (message.toLowerCase().includes("i rest my case") ||
               message.toLowerCase().includes("clearly superior") ||
               message.toLowerCase().includes("as expected") ||
               message.toLowerCase().includes("obviously") ||
               message.toLowerCase().includes("naturally")) {
        return "/images/characters/prosecutor_ego.png";
      }
      else {
        return "/images/characters/prosecutor_neutral.png";
      }
    }
    if (role === "witness") {
      return currentWitnessImage;
    }
    return "";
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Courtroom Background Image - Fixed as a full-screen background */}
      <div 
        className="fixed inset-0 h-full w-full"
        style={{ 
          backgroundImage: 'url("/images/Courtroom Background.png")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1, // Place behind all content
        }}
      ></div>

      {/* No white overlay anymore to make courtroom more visible */}

      {/* Content - ensure everything is above the background with z-index */}
      <div className={`relative z-10 flex flex-col h-screen ${isBadArgument ? 'animate-bad-argument' : ''}`}>
        {/* Top bar with game info and controls */}
        <div className="flex justify-between items-center p-4 bg-blue-600/90 text-white">
          <div>
            <h2 className="text-xl font-bold">Overruled!</h2>
            <p className="text-sm">
              Score: <span className="font-bold">{gameState.playerScore}/{requiredScore}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetWithNewCase}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              disabled={isPoorPerformance}
            >
              New Case
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded transition-colors"
              disabled={isPoorPerformance}
            >
              {showInfo ? "Hide Info" : "Show Info"}
            </button>
          </div>
        </div>

        {/* Case info panel - only visible when showInfo is true */}
        {showInfo && (
          <div className="p-4 bg-gray-100/90 backdrop-blur-sm m-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2 text-gray-800">{currentCase.title}</h3>
            <p className="mb-4 text-gray-700">{currentCase.description}</p>
            <div className="mb-4">
              <h4 className="font-bold mb-2 text-gray-800">Key Points:</h4>
              <ul className="list-disc pl-5 text-gray-700">
                {currentCase.keyPoints.map((point, index) => (
                  <li key={index} className="mb-1">{point}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main visual novel style interface */}
        <div className="flex-1 flex flex-col relative">
          {/* Character display area - takes up most of the screen */}
          <div className="flex-1 flex justify-center items-center">
            {/* Only show the current speaking character */}
            {messages.length > 0 && (
              <div className="character-display flex items-center justify-center h-full relative">
                {(() => {
                  // Get the last message to determine who's speaking
                  const lastMessage = messages[messages.length - 1];
                  
                  // Don't show character for system or player messages
                  if (lastMessage.role === 'system' || lastMessage.role === 'player') {
                    return null;
                  }
                  
                  // Determine which character image to show
                  let characterImage = "";
                  let characterName = "";
                  
                  if (lastMessage.role === "judge") {
                    if (lastMessage.content.toLowerCase().includes("overruled") || 
                        lastMessage.content.toLowerCase().includes("case dismissed") ||
                        lastMessage.content.toLowerCase().includes("in favor of the defense") ||
                        (showVerdict && verdictIsWin)) {
                      characterImage = "/images/characters/judge_happy.png";
                    } else if (lastMessage.content.toLowerCase().includes("time has expired") ||
                              lastMessage.content.toLowerCase().includes("in favor of the prosecution") ||
                              (showVerdict && !verdictIsWin)) {
                      characterImage = "/images/characters/judge_sad.png";
                    } else {
                      characterImage = "/images/characters/judge_neutral.png";
                    }
                    characterName = "Judge";
                  }
                  else if (lastMessage.role === "opponent") {
                    if (lastMessage.content.toLowerCase().includes("object") ||
                        lastMessage.content.toLowerCase().includes("your honor, with all due respect") ||
                        lastMessage.content.toLowerCase().includes("irrelevant") ||
                        lastMessage.content.toLowerCase().includes("misleading") ||
                        lastMessage.content.toLowerCase().includes("ridiculous") ||
                        lastMessage.content.toLowerCase().includes("absurd") ||
                        lastMessage.content.toLowerCase().includes("preposterous") ||
                        lastMessage.content.toLowerCase().includes("baseless")) {
                      characterImage = "/images/characters/prosecutor_angry.png";
                    }
                    else if (lastMessage.content.toLowerCase().includes("evidence shows") ||
                             lastMessage.content.toLowerCase().includes("clearly demonstrates") ||
                             lastMessage.content.toLowerCase().includes("beyond reasonable doubt") ||
                             lastMessage.content.toLowerCase().includes("proven") ||
                             lastMessage.content.toLowerCase().includes("the facts are clear") ||
                             lastMessage.content.toLowerCase().includes("as you can see") ||
                             lastMessage.content.toLowerCase().includes("the evidence is overwhelming")) {
                      characterImage = "/images/characters/prosecutor_happy.png";
                    }
                    else if (lastMessage.content.toLowerCase().includes("i rest my case") ||
                             lastMessage.content.toLowerCase().includes("clearly superior") ||
                             lastMessage.content.toLowerCase().includes("as expected") ||
                             lastMessage.content.toLowerCase().includes("obviously") ||
                             lastMessage.content.toLowerCase().includes("naturally")) {
                      characterImage = "/images/characters/prosecutor_ego.png";
                    }
                    else {
                      characterImage = "/images/characters/prosecutor_neutral.png";
                    }
                    characterName = "Prosecutor";
                  }
                  else if (lastMessage.role === "witness") {
                    characterImage = currentWitnessImage;
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
                  ) : null;
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
                Case Info
                      </div>
            )}
            
            {/* Game progress indicator */}
            <div className="flex justify-between text-sm text-gray-300 absolute top-3 right-6">
              <div className="mr-4">
                Score: <span className="font-bold">{gameState.playerScore}/{requiredScore}</span>
                      </div>
              <div>
                Response: <span className="font-bold">{newResponseCount}/{GAME_SETTINGS.maxResponses}</span>
                    </div>
                  </div>
            
            {/* Message display area */}
            <div className="flex-grow mb-20 overflow-y-auto max-h-[250px]">
              {/* Message content with typewriter effect */}
              <div className="dialogue-content text-xl leading-relaxed min-h-[150px] w-full pr-4">
                {messages.length > 0 ? (
                  <TypewriterText 
                    text={messages[messages.length - 1].content} 
                    speed={25} 
                  />
                ) : (
                  <span className="text-gray-400">Loading case...</span>
                )}
              </div>
            </div>

            {/* Player input area - only shown when it's the player's turn to respond */}
            {messages.length > 0 && 
             !isPoorPerformance && 
             !hasPendingMessages &&
             (messages[messages.length - 1].role === 'judge' || 
              messages[messages.length - 1].role === 'opponent' || 
              messages[messages.length - 1].role === 'witness' || 
              messages[messages.length - 1].role === 'system') && 
             !(messages.length === 1 && messages[0].role === 'judge') && (
              <div className="player-input mt-4 absolute bottom-40 left-6 right-6 transition-opacity duration-300">
                <form onSubmit={handlePlayerInput} className="flex items-center">
                  <input
                    type="text"
                    value={playerInput}
                    onChange={(e) => setPlayerInput(e.target.value)}
                    placeholder="Enter your response..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 text-black"
                    disabled={isPoorPerformance || hasPendingMessages}
                  />
                  <div className="flex space-x-2 ml-2">
                    {voiceSupported && (
                      <button
                        type="button"
                        onClick={toggleVoiceInput}
                        className={`p-2 rounded-lg transition-colors relative ${
                          isListening
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-blue-100 text-blue-500 hover:bg-blue-200"
                        }`}
                        disabled={isPoorPerformance || recordingState === 'processing' || hasPendingMessages}
                        title="Voice Input"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                        {recordingState === 'processing' && (
                          <span className="absolute top-0 right-0 h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                          </span>
                        )}
                        {recordingState === 'recording' && (
                          <span className="absolute top-0 right-0 h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                          </span>
                        )}
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`px-4 py-2 text-white rounded-lg transition-colors ${
                                isPoorPerformance || hasPendingMessages
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                      disabled={isPoorPerformance || hasPendingMessages}
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* ALWAYS VISIBLE NEXT BUTTON */}
            {/* This is a failsafe next button that will always be visible when needed */}
            {messageQueue.length > 0 && (
              <div 
                className="fixed bottom-40 right-6 z-50"
                style={{ pointerEvents: 'auto' }}
              >
                <button 
                  className="next-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-colors flex items-center text-lg font-bold"
                  onClick={advanceDialogue}
                >
                  {hasFinalVerdict ? "Show Verdict" : "Next"}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Next Case button when final verdict is shown */}
      {(() => {
        // Debug logging
        console.log('Final verdict status:', {
          hasFinalVerdict,
          messageQueueLength: messageQueue.length,
          finalVerdictOutcome
        });
        
        return hasFinalVerdict && !messageQueue.length && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[99999]" style={{ pointerEvents: 'auto' }}>
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-2xl transform scale-110">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                {finalVerdictOutcome === 'win' ? 'Case Won! 🎉' : 'Case Lost 😔'}
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                {finalVerdictOutcome === 'win' 
                  ? 'Congratulations! You have successfully won this case.' 
                  : 'Unfortunately, you did not win this case.'}
              </p>
              <button
                onClick={() => handleCaseEnd(finalVerdictOutcome === 'win')}
                className="px-8 py-4 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Next Case →
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};