import React from "react";

interface CardProps {
  content: string;
  icon: React.ElementType;
}

export default function Card({ content, icon: Icon }: CardProps) {
  return (
    <div>
      <div className="bg-[#232323] py-2 px-4 rounded-lg border border-[#2C2C2C] hover:scale-102 transition-scale duration-100 delay-75 ease-in-out shadow-md flex flex-row md:flex-col cursor-pointer items-center md:items-start gap-4 md:gap-2 justify-center md:justify-start">
        <h2 className="text-white text-xl font-bold mb-2">
          <Icon />
        </h2>
        <p className="text-[#999999] mb-2">{content}</p>
      </div>
    </div>
  );
}
