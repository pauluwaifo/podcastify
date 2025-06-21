import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu";
import { ChevronDown, LoaderCircle, Play, Speech, Square } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface AudioGenDropdownProps {
  setSelectedVoice: (voiceId: string) => void;
  voices: Voice[];
  selectedVoice: string;
  text: string;
}

interface Voice {
  name: string;
  voiceId: string;
  lang?: string;
}

export default function AudioGenDropdown({
  setSelectedVoice,
  selectedVoice,
  voices,
  text,
}: AudioGenDropdownProps) {
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const selectedVoiceName = voices.find(
    (v) => v.voiceId === selectedVoice
  )?.name;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setAvailableVoices(voices);
      };

      loadVoices();
      
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const findBestVoice = (voiceId: string): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    let voice = availableVoices.find(v => 
      v.name.toLowerCase() === voiceId.toLowerCase()
    );

    if (!voice) {
      voice = availableVoices.find(v => 
        v.name.toLowerCase().includes(voiceId.toLowerCase())
      );
    }

    if (!voice) {
      voice = availableVoices.find(v => 
        v.lang.toLowerCase().includes(voiceId.toLowerCase())
      );
    }

    if (!voice && voiceId.includes('female')) {
      voice = availableVoices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('susan')
      );
    }
    
    if (!voice && voiceId.includes('male')) {
      voice = availableVoices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('mark') ||
        v.name.toLowerCase().includes('daniel')
      );
    }

    if (!voice && voiceId.includes('british')) {
      voice = availableVoices.find(v => 
        v.lang.includes('en-GB') || 
        v.name.toLowerCase().includes('british')
      );
    }

    return voice || availableVoices[0];
  };

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setLoading(false);
    }
  };

  const generateAudio = async (text: string, voiceId: string) => {
    if (!synthRef.current || !text.trim()) return;

    stopAudio();
    
    setLoading(true);

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      const selectedVoice = findBestVoice(voiceId);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setLoading(false);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setIsPlaying(false);
        setLoading(false);
      };

      utterance.onpause = () => {
        setIsPlaying(false);
      };

      utterance.onresume = () => {
        setIsPlaying(true);
      };

      // Store reference for potential cancellation
      utteranceRef.current = utterance;

      // Start speaking
      synthRef.current.speak(utterance);

    } catch (error) {
      console.error("Audio generation failed:", error);
      setLoading(false);
      setIsPlaying(false);
    }
  };

  const handlePlayStop = () => {
    if (isPlaying || loading) {
      stopAudio();
    } else {
      generateAudio(text, selectedVoice);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 cursor-pointer">
          <Play className="text-white" size={18} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="bg-[#1E1E1E] border-[#2C2C2C] text-white p-3 w-72"
        align="start"
        side="top"
      >
        <div className="text-sm text-[#CCCCCC] mb-1">
          Generate audio content{" "}
          {selectedVoiceName && (
            <span className="text-white font-medium">
              ({selectedVoiceName})
            </span>
          )}
          <div className="text-xs text-[#888] mt-1">
            Free TTS • {availableVoices.length} voices available
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md text-sm">
                <Speech size={16} />
                <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="left"
              className="bg-[#1E1E1E] border border-[#333] p-2 rounded-md max-h-40 overflow-y-auto custom-scrollbar"
            >
              <div className="flex flex-col gap-1">
                {voices.map((v) => (
                  <button
                    key={v.voiceId}
                    onClick={() => {
                      setSelectedVoice(v.voiceId);
                      // Stop current audio when switching voices
                      if (isPlaying) stopAudio();
                    }}
                    className={`text-sm text-white px-3 py-[2px] rounded-md text-left w-full ${
                      selectedVoice === v.voiceId
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {v.name}
                    {v.lang && (
                      <span className="text-xs text-[#888] ml-2">
                        ({v.lang})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={handlePlayStop}
            disabled={!text?.trim()}
            className={`flex items-center justify-between gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md w-full ${
              !text?.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <>
              {isPlaying ? "Stop" : "Generate"}
              {loading ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : isPlaying ? (
                <Square size={14} />
              ) : (
                <Play size={14} />
              )}
            </>
          </button>
        </div>

        {/* Voice quality indicator */}
        {availableVoices.length > 0 && (
          <div className="mt-2 text-xs text-[#666]">
            Device voices: {availableVoices.filter(v => v.localService).length} local, {availableVoices.filter(v => !v.localService).length} online
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}