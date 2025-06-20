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

  const selectedVoiceName = voices.find(
    (v) => v.voiceId === selectedVoice
  )?.name;

  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());

  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play().catch((err) => {
      console.error("Audio playback failed:", err);
    });
  };

  const generateAndCacheAudio = async (text: string, voiceId: string) => {
    const key = `${text}-${voiceId}`;

    setLoading(true);

    // Check if audio is already cached
    if (audioCache.has(key)) {
      const cachedUrl = audioCache.get(key)!;
      playAudio(cachedUrl);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/openai/generate/audio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, voice: voiceId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Update cache and play audio
      setAudioCache((prevCache) => {
        const updatedCache = new Map(prevCache);
        updatedCache.set(key, audioUrl);
        return updatedCache;
      });

      playAudio(audioUrl);
    } catch (error) {
      console.error("Audio generation failed:", error);
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
            <span className="text-white font-medium">
              ({selectedVoiceName})
            </span>
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
                    className={`text-sm text-white px-3 py-[2px] rounded-md text-left w-full ${
                      selectedVoice === v.voiceId
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => generateAndCacheAudio(text, selectedVoice)}
            disabled={loading || !text}
            className={`flex items-center justify-between gap-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md w-full ${
              loading || !text ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <>
              Generate
              {loading ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <Play size={14} />
              )}
            </>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
