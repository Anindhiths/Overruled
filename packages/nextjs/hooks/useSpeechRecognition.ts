import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionResult {
  transcript: string;
  error: string | null;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  voiceSupported: boolean;
  recordingState: string;
}

export const useSpeechRecognition = (): SpeechRecognitionResult => {
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [recordingState, setRecordingState] = useState("inactive");
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognitionRef.current = new SpeechRecognition();
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        setVoiceSupported(true);

        speechRecognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("");
          setTranscript(transcript);
        };

        speechRecognitionRef.current.onerror = (event: any) => {
          setError(event.error);
          setIsRecording(false);
          setRecordingState("error");
        };

        speechRecognitionRef.current.onend = () => {
          setIsRecording(false);
          setRecordingState("inactive");
        };
      } else {
        setVoiceSupported(false);
        setError("Speech recognition not supported in this browser");
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    setError(null);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.start();
        setIsRecording(true);
        setRecordingState("recording");
      } catch (err) {
        setError("Error starting recording");
        setIsRecording(false);
        setRecordingState("error");
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsRecording(false);
      setRecordingState("inactive");
    }
  }, []);

  return {
    transcript,
    error,
    isRecording,
    startRecording,
    stopRecording,
    voiceSupported,
    recordingState,
  };
}; 