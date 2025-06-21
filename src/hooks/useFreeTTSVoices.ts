export interface Voice {
    name: string;
    voiceId: string;
    lang?: string;
    description?: string;
  }
  
  export const FREE_TTS_VOICES: Voice[] = [
    { 
      voiceId: "default", 
      name: "Default Voice", 
      lang: "en-US",
      description: "System default voice" 
    },
    { 
      voiceId: "female", 
      name: "Female Voice", 
      lang: "en-US",
      description: "Prefer female voice" 
    },
    { 
      voiceId: "male", 
      name: "Male Voice", 
      lang: "en-US",
      description: "Prefer male voice" 
    },
    
    // Language/accent based
    { 
      voiceId: "british", 
      name: "British English", 
      lang: "en-GB",
      description: "British accent" 
    },
    { 
      voiceId: "australian", 
      name: "Australian English", 
      lang: "en-AU",
      description: "Australian accent" 
    },
    
    // Common system voice names (these vary by platform)
    // iOS voices
    { 
      voiceId: "samantha", 
      name: "Samantha", 
      lang: "en-US",
      description: "Natural female voice (iOS)" 
    },
    { 
      voiceId: "alex", 
      name: "Alex", 
      lang: "en-US",
      description: "Natural male voice (iOS/macOS)" 
    },
    
    // Google voices (Android/Chrome)
    { 
      voiceId: "google", 
      name: "Google Voice", 
      lang: "en-US",
      description: "Google TTS voice" 
    },
    
    // Microsoft voices (Windows)
    { 
      voiceId: "zira", 
      name: "Microsoft Zira", 
      lang: "en-US",
      description: "Microsoft female voice" 
    },
    { 
      voiceId: "david", 
      name: "Microsoft David", 
      lang: "en-US",
      description: "Microsoft male voice" 
    },
    
    // Additional languages
    { 
      voiceId: "spanish", 
      name: "Spanish", 
      lang: "es-ES",
      description: "Spanish voice" 
    },
    { 
      voiceId: "french", 
      name: "French", 
      lang: "fr-FR",
      description: "French voice" 
    },
    { 
      voiceId: "german", 
      name: "German", 
      lang: "de-DE",
      description: "German voice" 
    }
  ];
  
  // Function to get available voices (call this in your component)
  export const getAvailableVoices = (): Voice[] => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return FREE_TTS_VOICES;
    }
    
    const systemVoices = window.speechSynthesis.getVoices();
    
    if (systemVoices.length === 0) {
      // Fallback to predefined voices if system voices aren't loaded yet
      return FREE_TTS_VOICES;
    }
    
    // Map system voices to our Voice interface
    const mappedVoices: Voice[] = systemVoices.map(voice => ({
      voiceId: voice.name,
      name: voice.name,
      lang: voice.lang,
      description: `${voice.localService ? 'Local' : 'Online'} voice`
    }));
    
    // Combine with our predefined voices for better user experience
    return [...FREE_TTS_VOICES, ...mappedVoices];
  };
  
  // Hook to manage voices state
  import { useState, useEffect } from 'react';
  
  export const useFreeTTSVoices = () => {
    const [voices, setVoices] = useState<Voice[]>(FREE_TTS_VOICES);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setLoading(false);
        return;
      }
      
      const loadVoices = () => {
        const availableVoices = getAvailableVoices();
        setVoices(availableVoices);
        setLoading(false);
      };
      
      // Load voices immediately
      loadVoices();
      
      // Also listen for voice changes
      const synth = window.speechSynthesis;
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }
      
      // Cleanup
      return () => {
        if (synth.onvoiceschanged !== undefined) {
          synth.onvoiceschanged = null;
        }
      };
    }, []);
    
    return { voices, loading };
  };