import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
  } from "../ui/dropdown-menu";
  import { ChevronDown, LoaderCircle, Play, Speech } from "lucide-react";
  import { useState } from "react";
  
  interface AudioGenDropdownProps {
    setSelectedVoice: (voiceId: string) => void;
    voices: Voice[];
    selectedVoice: string;
    text: string;
  }
  
  interface Voice {
    name: string;
    voiceId: string;
  }
  
  export default function AudioGenDropdown({
    setSelectedVoice,
    selectedVoice,
    voices,
    text,
  }: AudioGenDropdownProps) {
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
    const selectedVoiceName = voices.find((v) => v.voiceId === selectedVoice)?.name;
  
    const generateAndPlayAudio = async () => {
      if (!text || !selectedVoice) return;
  
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/elevenlabs/generate/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text, voiceId: selectedVoice }),
        });
  
        if (!response.ok) throw new Error(`Failed to fetch audio ${response}`);
  
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
  
        new Audio(url).play();
      } catch (err) {
        console.error("Audio generation failed:", err);
      } finally {
        setLoading(false);
      }
    };
  
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
              <span className="text-white font-medium">({selectedVoiceName})</span>
            )}
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
                      onClick={() => setSelectedVoice(v.voiceId)}
                      className={`text-sm px-3 py-[2px] rounded-md text-left w-full ${
                        selectedVoice === v.voiceId ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
  
            <button
              onClick={generateAndPlayAudio}
              disabled={loading || !text}
              className={`flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md w-full ${
                loading || !text ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <>
                  Generate
                  <Play size={14} />
                </>
              )}
            </button>
          </div>
  
          {audioUrl && (
            <audio controls className="mt-3 w-full">
              <source src={audioUrl} type="audio/mpeg" />
            </audio>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  