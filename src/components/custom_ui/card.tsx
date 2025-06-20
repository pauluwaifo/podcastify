import React from "react";

interface CardProps {
  content: string;
  icon: React.ElementType;
}

export default function Card({ content, icon: Icon }: CardProps) {
  return (
    <div>
      <div className="bg-[#232323] py-2 px-4 rounded-lg border border-[#2C2C2C] hover:scale-102 transition-scale duration-100 delay-75 ease-in-out shadow-md flex flex-col cursor-pointer">
        <h2 className="text-white text-xl font-bold mb-2">
          <Icon />
        </h2>
        <p className="text-[#999999] mb-4">{content}</p>
      </div>
    </div>
  );
}
