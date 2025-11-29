import React from 'react';

interface HeaderProps {
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="w-full py-6 px-4 md:px-8 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onReset} title="Go to Home">
        <h1 className="text-4xl font-bold text-[#1F2937] tracking-wide font-['Geo']">
          camosnoop
        </h1>
      </div>
      
      {/* Reset button removed from header as requested */}
    </header>
  );
};