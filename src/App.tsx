import { useEffect, useRef } from "react";
import {
  SendHorizontal,
  FileText,
  X,
  Link,
  User2,
  LoaderCircle,
  Info,
  AudioWaveform,
} from "lucide-react";
import "./App.css";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";

import LinkInputDropdown from "./components/custom_ui/LinkInputDropdown";
import UploadFileDropDown from "./components/custom_ui/UploadFileDropDown";
import WelcomeScreen from "./components/welcome_screen";
import Content from "./components/content_screen";

export interface ConversationType {
  prompt: string;
  response: string;
  filesProcessed: number;
}

function App() {
  const [fileContent, setFileContent] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [prompt, setPrompt] = useState<string>("");
  const [targetLength, setTargetLength] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationType[]>([
    { response: "", prompt: "", filesProcessed: 0 },
  ]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fullPrompt = `${prompt} make it ${
    targetLength !== "" ? targetLength : "10"
  } minutes long`;
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
  
    if (prompt.trim() === "") {
      el.style.height = "40px";
    } else {
      el.style.height = "auto"; 
      el.style.height = `${el.scrollHeight}px`; 
    }
  }, [prompt]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("prompt", fullPrompt);
      setPrompt("");

      if (link.trim()) {
        formData.append("urls", link);
      }

      if (fileContent) {
        formData.append("files", fileContent);
      }

      const res = await fetch(
        "https://podcastify-xq9b.onrender.com/api/genai/generate",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);

      const newEntry = {
        prompt,
        response: data.data,
        filesProcessed: data.filesProcessed,
      };

      setConversations((prev) => [...prev, newEntry]);
      setContent(true);
      setLink(""); // Clear the link input
      setFileContent(null);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col flex-wrap items-center justify-center h-screen max-h-screen bg-[#121212] p-0 md:p-3 ">
      <div className="shadow-xl w-full h-full border border-[#2C2C2C] rounded-none md:rounded-lg bg-[#1E1E1E] relative overflow-hidden">
        {/* topbar */}
        <div className="absolute left-0 top-0 w-full flex flex-row items-center mb-8 p-1 bg-[#232323] rounded-t-lg border-b border-[#2C2C2C]">
          <div className="basis-2/12 md:basis-3/12 px-4">
            <h1 className="text-white text-lg font-bold hidden md:block">
              Podcast Generator
            </h1>
            <h1 className="text-white text-lg font-bold sm:hidden block">
              PDG
            </h1>
          </div>

          <div className="basis-10/12 md:basis-9/12 flex flex-row items-center gap-4 justify-end ">
            <p className="bg-white/5 text-red-200/50 text-sm p-2 rounded-lg hidden md:block">
              Note: Refreshing of browser will lead to loss of data
            </p>

            <div className="block md:hidden">
              <Tooltip>
                <TooltipTrigger>
                  <button
                    disabled
                    className={`p-2 rounded-lg bg-white/5 backdrop-blur-sm opacity-50 cursor-not-allowed`}
                  >
                    <Info className="text-red-500" size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="text-red-500" side="bottom">
                  Note: Refreshing of browser will lead to loss of data
                </TooltipContent>
              </Tooltip>
            </div>

            <Tooltip>
              <TooltipTrigger>
                <button
                  disabled
                  className={`p-2 rounded-lg bg-white/5 backdrop-blur-sm opacity-50 cursor-not-allowed`}
                >
                  <User2 className="text-white" size={20} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Hello User welcome! to Genai
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="h-[48px] w-full" />
        {/* main */}

        {!content && !loading ? (
          <WelcomeScreen />
        ) : (
          <div className="pb-[180px] h-full">
            <Content
              conversations={conversations}
              content={content}
              loading={loading}
              isGenerating={isGenerating}
            />
          </div>
        )}
        {/* footer */}
        <div className="absolute bottom-0 left-0 w-full flex items-center justify-center pb-4 px-4 bg-[#1E1E1E]">
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col items-center justify-between border w-[500px] md:w-170 border-[#2C2C2C] bg-[#232323] px-4 py-3 rounded-2xl gap-2"
          >
            <div className="items-start flex w-full gap-2">
              {fileContent && (
                <div className="text-sm text-white relative items-center justify-between font-poppins gap-2 border border-[#2C2C2C] p-2 rounded-xl min-w-20">
                  <div>
                    <FileText size={15} className="min-w-4" />
                    <span className="whitespace-nowrap text-ellipsis">
                      {fileContent.name}
                    </span>
                  </div>

                  <button
                    onClick={() => setFileContent(null)}
                    className="text-white transition absolute top-1 right-1 p-1 rounded-full bg-white/10 hover:bg-white/20"
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              {link && (
                <div className="text-sm text-white relative items-center justify-between font-poppins gap-2 border border-[#2C2C2C] p-2 rounded-xl min-w-30">
                  <div>
                    <Link size={15} className="min-w-4" />
                    <Tooltip>
                      <TooltipTrigger>
                        <a
                          href={link}
                          target="_blank"
                          className="underline text-blue-300"
                        >
                          Podcast Link
                        </a>
                        <TooltipContent>{`${link}`}</TooltipContent>
                      </TooltipTrigger>
                    </Tooltip>
                  </div>

                  <button
                    onClick={() => setLink("")}
                    className="text-white transition absolute top-1 right-1 p-1 rounded-full bg-white/10 hover:bg-white/20"
                    aria-label="Remove file"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-between w-full">
              <textarea
                ref={textareaRef}
                onChange={(e) => handlePromptChange(e)}
                value={prompt}
                placeholder="Enter Focus Prompt..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const currentValue = e.currentTarget.value;
                    if (currentValue.trim() || fileContent) {
                      handleSubmit(e as any);
                    }
                  }
                }}
                className="w-full px-4  rounded-md bg-transparent text-white placeholder:text-[#666] outline-none resize-none overflow-y-auto custom-scrollbar max-h-100"
              />

              <button
                type="submit"
                disabled={loading || (prompt.length === 0 && !fileContent)}
                className={`p-2 rounded-lg ${
                  prompt.length > 0 || fileContent
                    ? "opacity-100 cursor-pointer"
                    : "opacity-30 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <LoaderCircle className="animate-spin text-white" size={20} />
                ) : (
                  <SendHorizontal className="text-white" size={20} />
                )}
              </button>
            </div>

            {/* form footer */}
            <div className="flex justify-between items-center w-full gap-2">
              <div className="flex items-center gap-2 basis-1/2 justify-start">
                <Tooltip>
                  <TooltipTrigger>
                    <UploadFileDropDown setFileContent={setFileContent} />
                  </TooltipTrigger>
                  <TooltipContent side="left">More Options</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <LinkInputDropdown setLink={setLink} />
                  </TooltipTrigger>
                  <TooltipContent side="right">Input Link</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2 basis-1/2 justify-end">
                <Tooltip>
                  <TooltipTrigger className="flex-row flex gap-2">
                    <div
                      className={`p-2 rounded-lg bg-white/5 backdrop-blur-sm opacity-50 cursor-not-allowed`}
                    >
                      <AudioWaveform className="text-white" size={20} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    Enter Target Length
                  </TooltipContent>
                </Tooltip>
                <input
                  className="custom-scrollbar border-[#2C2C2C] placeholder:text-[#666666] outline-none text-[#B0B0B0] border rounded-lg px-4 w-20 h-9"
                  type="number"
                  onChange={(e) => setTargetLength(e.target.value)}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
