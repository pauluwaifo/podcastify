import { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../ui/dropdown-menu";
import { Link } from "lucide-react";

export default function LinkInputDropdown({
  setLink,
}: {
  setLink: React.Dispatch<React.SetStateAction<string>>;
}) {
  
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (inputValue.trim()) {
      setLink(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1 cursor-pointer">
            <Link className="text-white" size={15} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="bg-[#1E1E1E] border-[#2C2C2C] text-white p-3 w-64"
          align="start"
        >
          <label className="block text-sm text-[#CCCCCC] mb-1">
            Enter a link
          </label>
          <input
            ref={inputRef}
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 text-sm rounded-md bg-[#2A2A2A] text-white border border-[#444] focus:outline-none focus:ring-2 focus:ring-[#555]"
          />
          <button
            onClick={handleSave}
            className="mt-2 text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md w-full"
          >
            Save Link
          </button>
        </DropdownMenuContent>
      </DropdownMenu>

      
    </div>
  );
}
