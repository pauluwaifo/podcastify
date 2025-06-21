import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  LoaderCircle,
  FileText,
} from "lucide-react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";
import { useEffect, useState, useRef } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import type { ConversationType } from "../App";
import AudioGenDropdown from "./custom_ui/AudioGenDropdown";
import { useFreeTTSVoices } from "../hooks/useFreeTTSVoices";

interface ContentProps {
  conversations: ConversationType[];
  loading: boolean;
  content: boolean;
  isGenerating: boolean;
}

export default function Content({
  conversations,
  loading,
  content,
  isGenerating,
}: ContentProps) {
  const { copy, copied } = useCopyToClipboard();
  const [selectedVoices, setSelectedVoices] = useState<Record<number, string>>(
    {}
  );
  const generatingRef = useRef<HTMLDivElement>(null);
  const {voices} = useFreeTTSVoices()

  const [feedback, setFeedback] = useState<
    Record<number, "like" | "dislike" | null>
  >({});

 

  useEffect(() => {
    if (content && isGenerating && generatingRef.current) {
      generatingRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isGenerating, content]);
  

  const handleLike = (index: number) => {
    setFeedback((prev) => ({ ...prev, [index]: "like" }));
  };

  const handleDislike = (index: number) => {
    setFeedback((prev) => ({ ...prev, [index]: "dislike" }));
  };

  return (
    <div className="relative flex flex-col items-center h-full justify-center overflow-y-scroll dark custom-scrollbar p-2 ">
      <div className="absolute w-full top-0 left-0 flex flex-col items-center justify-center p-2 gap-4 w-full bg-[#1E1E1E]">
        <div className="flex flex-col items-center justify-center p-2 gap-4 w-full md:w-1/2 bg-[#1E1E1E]">
          {!content && loading ? (
            <div>
              <SkeletonTheme baseColor="#2C2C2C" highlightColor="#1E1E1E">
                <Skeleton width={350} height={50} />
                <Skeleton width={350} count={4} />
              </SkeletonTheme>
              <p className="text-[#999999] text-xs font-poppins font-regular text-center">
                <i>GEN-AI</i> RATING CONTENT.. ✨
              </p>
            </div>
          ) : (
            <div className="">
              {conversations.slice(1).map((conv, index) => {
                const isLiked = feedback[index] === "like";
                const isDisliked = feedback[index] === "dislike";

                return (
                  <div key={index} className=" flex flex-col gap-5 p-4">
                    <div className="w-full flex flex-col gap-2 items-end justify-end">
                      <div className="min-w-[200px] max-w-[400px] text-wrap px-2 py-2 items-start justify-start flex flex-col rounded-xl bg-[#2A2A2A]">
                        <p className="text-[#BBBBBB] text-sm ">Prompt:</p>
                        <p className="text-white font-poppins whitespace-pre-wrap">
                          {conv.prompt && conv.filesProcessed > 0 ? (
                            <>
                              <FileText /> {conv.prompt}
                            </>
                          ) : conv.prompt && conv.filesProcessed < 1 ? (
                            conv.prompt
                          ) : (
                            <FileText />
                          )}
                        </p>
                      </div>
                      <button
                        className="text-white cursor-pointer"
                        onClick={() => copy(conv.prompt)}
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                    <div className="p-4 rounded-xl ">
                      <p className="text-[#BBBBBB] text-sm mb-1">Response:</p>
                      <pre className="text-white font-poppins whitespace-pre-wrap break-words text-[.9rem] mb-3">
                        {conv.response}
                      </pre>
                      <div className="flex gap-3">
                        <button
                          className="text-white cursor-pointer"
                          onClick={() => copy(conv.response)}
                        >
                          {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        <AudioGenDropdown
                          voices={voices}
                          text={conv.response}
                          selectedVoice={selectedVoices[index]}
                          setSelectedVoice={(voiceId: string) =>
                            setSelectedVoices((prev) => ({
                              ...prev,
                              [index]: voiceId,
                            }))
                          }
                        />
                        <button
                          className={`cursor-pointer ${
                            isLiked ? "text-green-500" : "text-white"
                          } ${isDisliked ? "hidden" : ""}`}
                          onClick={() => handleLike(index)}
                        >
                          <ThumbsUp size={18} />
                        </button>
                        <button
                          className={`cursor-pointer ${
                            isDisliked ? "text-red-500" : "text-white"
                          } ${isLiked ? "hidden" : ""}`}
                          onClick={() => handleDislike(index)}
                        >
                          <ThumbsDown size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {content && isGenerating ? (
            <div ref={generatingRef} className="flex flex items-center justify-center w-full text-white text-lg font-poppins gap-2">
              Generating
              <LoaderCircle size={30} className="animate-spin text-white" />
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
      <div className="mt-[30px]" />
    </div>
  );
}
