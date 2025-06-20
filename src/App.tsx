import {
  SendHorizontal,
  FileAudio,
  FileText,
  X,
  Link,
  User2,
  Loader,
  LoaderCircle,
} from "lucide-react";
import "./App.css";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import { apiRequest } from "./hooks/useApi";

import LinkInputDropdown from "./components/custom_ui/LinkInputDropdown";
import UploadFileDropDown from "./components/custom_ui/UploadFileDropDown";
import WelcomeScreen from "./components/welcome_screen";
import Content from "./components/content_screen";

export interface ConversationType {
  prompt: string;
  response: string;
}

function App() {
  const [fileContent, setFileContent] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<boolean>(false);
  const [conversations, setConversations] = useState<ConversationType[]>([
    { response: "", prompt: "" },
  ]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    console.log(prompt);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setIsGenerating(true);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (fileContent) {
        formData.append("files", fileContent); // match backend key name
      }

      const res = await fetch("https://podcastify-xq9b.onrender.com/api/genai/generate", {
        method: "POST",
        body: formData, // no need for content-type
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);

      const newEntry = {
        prompt,
        response: data.data,
      };

      console.log(data);

      setConversations((prev) => [...prev, newEntry]);
      setContent(true);
      setPrompt("");
      setFileContent(null);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col flex-wrap items-center justify-center h-screen min-h-screen bg-[#121212] p-0 md:p-3 ">
      <div className="shadow-xl w-full h-full border border-[#2C2C2C] rounded-none md:rounded-lg bg-[#1E1E1E] relative overflow-hidden">
        {/* topbar */}
        <div className="absolute left-0 top-0 w-full flex items-center flex-wrap mb-8 p-1 bg-[#232323] rounded-t-lg border-b border-[#2C2C2C]">
          <div className="basis-3/12 px-4">
            <h1 className="text-white text-lg font-bold">Podcast Generator</h1>
          </div>
          <div className="basis-9/12 flex flex-row items-center gap-4 justify-end">
            <p className="bg-white/5 text-red-200/50 text-sm p-2 rounded-lg">
              Note: Refreshing of browser will lead to loss of data
            </p>
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
        <div className="absolute bottom-0 left-0 w-full flex items-center justify-center pb-4 bg-[#1E1E1E]">
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
              <input
                onChange={(e) => handlePromptChange(e)}
                value={prompt}
                type="text"
                placeholder="Enter Focus Prompt..."
                className="w-full flex-grow placeholder:text-[#666666] border py-2 border-none outline-none text-[#B0B0B0] bg-transparent w-full"
              />
              <button
                type="submit"
                disabled={!loading || prompt.length > 0 || fileContent ? false : true}
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
                  <TooltipTrigger>
                    <button
                      disabled
                      className={`p-2 rounded-lg bg-white/5 backdrop-blur-sm opacity-50 cursor-not-allowed`}
                    >
                      <FileAudio className="text-white" size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Generate Audio File
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
