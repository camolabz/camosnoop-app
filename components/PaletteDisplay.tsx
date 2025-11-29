
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { ColorItem } from '../types';
import { ShareModal } from './ShareModal';
import { encodePalette } from '../utils';

interface PaletteDisplayProps {
  colors: ColorItem[];
  onSave: (name: string) => void;
}

const MatchSkeleton = () => (
  <div className="animate-pulse flex items-center gap-2 opacity-80">
    <div className="w-5 h-5 rounded-full bg-slate-300 shrink-0"></div>
    <div className="flex flex-col gap-2 w-full">
      <div className="h-3 bg-slate-300 rounded w-20"></div>
      <div className="h-2 bg-slate-200 rounded w-28"></div>
    </div>
  </div>
);

export const PaletteDisplay: React.FC<PaletteDisplayProps> = ({ colors, onSave }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  // State to simulate the processing/fetching of complex matches
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  // Reset loading state when colors change and simulate processing time
  useEffect(() => {
    setIsLoadingMatches(true);
    // Increased duration to 2.5s so it is clearly visible AFTER the card entry animation (0.7s) finishes
    const timer = setTimeout(() => {
      setIsLoadingMatches(false);
    }, 2500); 
    return () => clearTimeout(timer);
  }, [colors]);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleShareClick = () => {
    // Generate the unique URL for this palette
    const encoded = encodePalette(colors);
    const url = `${window.location.origin}${window.location.pathname}?palette=${encoded}`;
    setShareUrl(url);
    setShowShareModal(true);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    
    // --- Header ---
    let y = 15;
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55); // #1F2937
    doc.setFont("helvetica", "bold");
    doc.text('camosnoop', margin, y);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text('See the Invisible. Create the Unseen.', margin, y + 5);
    
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 30, y);

    y += 15; // Start content at y = 30

    // --- Grid Layout Setup ---
    const colGap = 8;
    const rowGap = 10;
    const cols = 4;
    const cardWidth = (pageWidth - (margin * 2) - (colGap * (cols - 1))) / cols;
    const cardHeight = 80; // Compact height to fit 2 rows in landscape

    colors.forEach((color, index) => {
      // Calculate Grid Position
      const colIndex = index % cols;
      
      // Check Page Break
      // If we are starting a new row, check if it fits
      if (colIndex === 0) {
         const nextRowEnd = y + cardHeight;
         if (nextRowEnd > pageHeight - 10) {
            doc.addPage();
            y = 20; // Reset Y for new page
         }
      }

      const x = margin + (colIndex * (cardWidth + colGap));
      
      // --- Draw Card Container ---
      // Border & Background
      doc.setDrawColor(230, 230, 230); // Slate-200
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'FD');

      // --- Color Swatch (Top Section) ---
      doc.setFillColor(color.hex);
      const swatchHeight = 25;
      doc.rect(x + 0.5, y + 0.5, cardWidth - 1, swatchHeight, 'F'); 
      
      // --- Content Area ---
      const contentX = x + 4;
      let contentY = y + swatchHeight + 6;

      // Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text(color.name, contentX, contentY);

      // Hex
      contentY += 5;
      doc.setFont("courier", "normal"); // Mono font for hex
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(color.hex.toUpperCase(), contentX, contentY);

      // Description
      contentY += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(75, 85, 99); // Slate-600
      const descWidth = cardWidth - 8;
      const splitDesc = doc.splitTextToSize(color.description, descWidth);
      // Limit description lines strictly
      const maxLines = 2;
      const displayDesc = splitDesc.length > maxLines 
        ? [...splitDesc.slice(0, maxLines), '...'] 
        : splitDesc;
      
      doc.text(displayDesc, contentX, contentY);
      
      // Adjust Y based on description length
      contentY += (displayDesc.length * 3.5) + 3;

      // --- Matches Divider ---
      doc.setDrawColor(240);
      doc.line(x + 2, contentY, x + cardWidth - 2, contentY);
      contentY += 4;

      // --- Paint/Pantone Matches ---
      const matchFontSize = 7;
      doc.setFontSize(matchFontSize);

      // Golden Acrylic
      if (color.matchingPaint) {
        doc.setFillColor(color.matchingPaint.hex);
        doc.circle(contentX + 2, contentY - 1, 1.5, 'F');
        doc.setTextColor(100);
        const paintName = doc.splitTextToSize(`Golden: ${color.matchingPaint.name}`, cardWidth - 10);
        doc.text(paintName[0], contentX + 5, contentY);
        contentY += 4;
      }

      // Pantone
      if (color.matchingPantone) {
        doc.setFillColor(color.matchingPantone.hex);
        doc.circle(contentX + 2, contentY - 1, 1.5, 'F');
        doc.setTextColor(100);
        const pName = doc.splitTextToSize(`Pantone: ${color.matchingPantone.code}`, cardWidth - 10);
        doc.text(pName[0], contentX + 5, contentY);
      }

      // --- Buy Button ---
      const buttonY = y + cardHeight - 10;
      const buttonHeight = 7;
      
      doc.setFillColor(31, 41, 55); 
      doc.roundedRect(contentX, buttonY, cardWidth - 8, buttonHeight, 1, 1, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      const btnText = "BUY ON AMAZON";
      const textWidth = doc.getTextWidth(btnText);
      const textX = contentX + ((cardWidth - 8) / 2) - (textWidth / 2);
      doc.text(btnText, textX, buttonY + 5);
      
      doc.link(contentX, buttonY, cardWidth - 8, buttonHeight, { url: 'https://amzn.to/4rcBbla' });

      // Update Y if end of row
      if (colIndex === cols - 1) {
        y += cardHeight + rowGap;
      }
    });

    // Footer
    const footerY = pageHeight - 5;
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text('Generated by camosnoop Web App', pageWidth / 2, footerY, { align: 'center' });

    doc.save(`camosnoop-palette-${Date.now()}.pdf`);
  };

  if (colors.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#1F2937]">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clipRule="evenodd" />
          </svg>
          Extracted Palette
        </h2>

        {/* Actions Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#1F2937] hover:border-[#1F2937] transition-all shadow-sm hover:shadow-md"
            title="Share Palette"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share
          </button>

          {/* PDF Button */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#1F2937] hover:border-[#1F2937] transition-all shadow-sm hover:shadow-md"
            title="Export as PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            PDF
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {colors.map((color, index) => (
          <div 
            key={color.hex + index}
            className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full"
          >
            {/* Color Swatch */}
            <div 
              className="h-32 w-full relative cursor-pointer shrink-0"
              style={{ backgroundColor: color.hex }}
              onClick={() => copyToClipboard(color.hex)}
            >
               <div className={`absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                  <span className="text-white font-semibold tracking-wide">
                    {copiedHex === color.hex ? 'Copied!' : 'Copy HEX'}
                  </span>
               </div>
            </div>

            {/* Details */}
            <div className="p-4 flex-grow flex flex-col">
              <div className="mb-3">
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{color.name}</h3>
                <p className="font-mono text-xs text-slate-400 mt-1 uppercase tracking-wider">{color.hex}</p>
              </div>
              
              <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
                {color.description}
              </p>
              
              {/* Matches Section */}
              <div className="space-y-4 pt-3 border-t border-slate-100 flex-grow">
                {/* Golden Acrylics Match */}
                {isLoadingMatches ? (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Closest Golden® Acrylic</p>
                    <MatchSkeleton />
                  </div>
                ) : (
                  color.matchingPaint && (
                    <div className="animate-in fade-in duration-300">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Closest Golden® Acrylic</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded-full border border-slate-200 shadow-sm shrink-0"
                          style={{ backgroundColor: color.matchingPaint.hex }}
                        ></div>
                        <span className="text-xs font-semibold text-slate-700 line-clamp-1" title={color.matchingPaint.name}>
                          {color.matchingPaint.name}
                        </span>
                      </div>
                    </div>
                  )
                )}

                {/* Pantone Match */}
                {isLoadingMatches ? (
                   <div>
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Closest Pantone®</p>
                     <MatchSkeleton />
                   </div>
                ) : (
                  color.matchingPantone && (
                    <div className="animate-in fade-in duration-300 delay-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Closest Pantone®</p>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-5 h-5 rounded-sm border border-slate-200 shadow-sm shrink-0"
                          style={{ backgroundColor: color.matchingPantone.hex }}
                        ></div>
                        <div className="flex flex-col leading-none overflow-hidden">
                          <span className="text-xs font-bold text-slate-800 truncate" title={color.matchingPantone.code}>
                            {color.matchingPantone.code}
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {color.matchingPantone.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Buy Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href="https://amzn.to/4rcBbla"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-2 text-xs font-bold uppercase tracking-wider text-[#1F2937] bg-slate-50 hover:bg-[#1F2937] hover:text-white rounded-lg transition-colors border border-slate-200 hover:border-[#1F2937]"
                >
                  Buy on Amazon
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gradient Bar Visualization */}
      <div className="mt-12 rounded-full h-4 w-full flex overflow-hidden shadow-inner">
        {colors.map((color) => (
          <div 
            key={color.hex} 
            style={{ backgroundColor: color.hex }} 
            className="flex-1 h-full"
            title={color.name}
          />
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          url={shareUrl} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </div>
  );
};
