import React, { useState } from 'react';

const FAQItem: React.FC<{ question: string; answer: React.ReactNode }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left focus:outline-none group"
      >
        <span className="font-semibold text-slate-700 group-hover:text-[#1F2937] transition-colors">{question}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-sm text-slate-600 leading-relaxed">
          {answer}
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Frequently Asked Questions</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-2">
        <FAQItem 
          question="How do I use Camosnoop?" 
          answer="It's simple! 1. Upload a photo or enter a location. 2. Click 'Snoop Away'. 3. Our AI analyzes the visual data to extract a harmonious color palette, complete with paint and Pantone matches." 
        />
        <FAQItem 
          question="What is Hybrid Mode?" 
          answer="Hybrid Mode allows you to combine 'Inspiration' (your uploaded photos) with 'Context' (a specific location). The AI generates a palette that bridges your aesthetic goals with the reality of the physical site." 
        />
        <FAQItem 
          question="How accurate are the Paint and Pantone matches?" 
          answer="We use a sophisticated perceptual color-matching algorithm (CIELAB Delta E) to find the mathematically closest match in our database. However, digital screens vary, and physical paint mixing is complex. Always test physical samples before purchasing." 
        />
        <FAQItem 
          question="Is my data saved?" 
          answer="Your uploaded images are processed in memory and are not permanently stored on our servers. The color palettes you generate can be saved to your browser's local storage if you use the Save feature." 
        />
      </div>
    </div>
  );
};