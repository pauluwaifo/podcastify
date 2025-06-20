import React, { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Plus, FileText } from "lucide-react";

export default function UploadFileDropDown({
  setFileContent,
}: {
  setFileContent: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileContent(file); // Send the actual File object to parent
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1 cursor-pointer">
            <Plus className="text-white" size={18} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-[#1E1E1E] text-white border border-[#2C2C2C] shadow-md rounded-md">
          <DropdownMenuLabel className="text-[#999999] font-poppins font-bold">
            Upload File
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#2C2C2C]" />

          <DropdownMenuItem
            className="p-0"
            style={{ background: "transparent" }}
            onSelect={(e) => e.preventDefault()}
          >
            <button
              type="button"
              onClick={handleClick}
              className="flex items-center gap-2 w-full font-poppins text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-md"
            >
              <FileText className="mr-2 h-4 w-4" />
              Upload a .txt, .pdf or .md file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
