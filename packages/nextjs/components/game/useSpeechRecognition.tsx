import { useState, useRef, useCallback, useEffect } from 'react';

type RecordingState = 'inactive' | 'recording' | 'error';

interface UseSpeechRecognitionReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  transcript: string;
  voiceSupported: boolean;
  recordingState: RecordingState;
  error: string | null;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [voiceSupported, setVoiceSupported] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [recordingState, setRecordingState] = useState<RecordingState>('inactive');
  const [error, setError] = useState<string | null>(null);

  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setVoiceSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.continuous = true;
        speechRecognitionRef.current.interimResults = true;
        
        speechRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setTranscript(transcript);
        };

        speechRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setError(event.error);
          setRecordingState('error');
        };

        speechRecognitionRef.current.onend = () => {
          if (recordingState === 'recording') {
            speechRecognitionRef.current?.start();
          }
        };
      }
    }

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [recordingState]);

  const startRecording = useCallback(async () => {
    setError(null);
    if (!speechRecognitionRef.current) {
      setError('Speech recognition is not supported in this browser');
      setRecordingState('error');
      return;
    }

    try {
      await speechRecognitionRef.current.start();
      setRecordingState('recording');
    } catch (err) {
      setError('Error starting recording');
      setRecordingState('error');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setRecordingState('inactive');
    }
  }, []);

  return {
    isRecording: recordingState === 'recording',
    startRecording,
    stopRecording,
    transcript,
    voiceSupported,
    recordingState,
    error,
  };
}; 