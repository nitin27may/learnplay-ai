'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export function useVoiceMode() {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSupported: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    transcript: '',
    error: null,
  });
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const results = Array.from(event.results);
          const transcript = results
            .map((result) => result[0])
            .map((alternative) => alternative.transcript)
            .join('');
          
          setVoiceState(prev => ({ ...prev, transcript }));
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setVoiceState(prev => ({
            ...prev,
            isListening: false,
            error: event.error,
          }));
        };

        recognition.onend = () => {
          setVoiceState(prev => ({ ...prev, isListening: false }));
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !voiceState.isListening) {
      setVoiceState(prev => ({ ...prev, transcript: '', error: null }));
      recognitionRef.current.start();
      setVoiceState(prev => ({ ...prev, isListening: true }));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Call Eleven Labs TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.warn('Eleven Labs TTS failed, using browser fallback');
        speakWithBrowserTTS(text);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      speakWithBrowserTTS(text);
    }
  };

  const speakWithBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return {
    ...voiceState,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}
