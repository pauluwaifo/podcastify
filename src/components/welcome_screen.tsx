import { ScrollText, FileAudio, Play, MicVocal } from "lucide-react";
import Card from "./custom_ui/card";


export default function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-4">
        
        <div className="items-center flex flex-col basis-1/2">
          <p className="text-[#999999] text-xs font-poppins font-regular">
            WELCOME TO THE PODCASTIFY <i>GEN-AI </i>
          </p>
          <p className="text-[#999999] text-4xl font-poppins font-medium">
            How can i help?
          </p>
          <div className="flex flex-row gap-4 mt-5">
            <Card
              content="Turn content into a podcast script"
              icon={ScrollText}
            />
            <Card content="Generate audio podcast" icon={FileAudio} />
            <Card content="Instant audio playback within the app" icon={Play} />
          </div>
        </div>
      </div>
    </div>
  );
}
