import React from 'react';

interface FooterProps {
  onNavigate: (page: 'home' | 'faq' | 'legal') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} camosnoop.</p>
        
        <div className="flex gap-6 text-sm font-medium text-slate-500">
          <button 
            onClick={() => onNavigate('faq')}
            className="hover:text-[#1F2937] transition-colors"
          >
            FAQ
          </button>
          <button 
            onClick={() => onNavigate('legal')}
            className="hover:text-[#1F2937] transition-colors"
          >
            Legal
          </button>
        </div>
      </div>
    </footer>
  );
};