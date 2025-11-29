
import React from 'react';
import { SavedPalette } from '../types';

interface SavedPalettesListProps {
  palettes: SavedPalette[];
  onDelete: (id: string) => void;
}

export const SavedPalettesList: React.FC<SavedPalettesListProps> = ({ palettes, onDelete }) => {
  if (palettes.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-16 pb-12 border-t border-slate-200 pt-12">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#1F2937]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
        </svg>
        Saved Collection
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {palettes.map((palette) => (
          <div key={palette.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-800 truncate pr-2">{palette.name}</h3>
                  <p className="text-xs text-slate-400">
                    {new Date(palette.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(palette.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  title="Delete Palette"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Mini visualizer */}
              <div className="h-12 w-full rounded-lg flex overflow-hidden">
                {palette.colors.map((color, idx) => (
                  <div
                    key={idx}
                    style={{ backgroundColor: color.hex }}
                    className="flex-1 h-full"
                    title={color.name}
                  />
                ))}
              </div>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {palette.colors.slice(0, 5).map((color, idx) => (
                   <span key={idx} className="text-[10px] font-mono bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">
                     {color.hex}
                   </span>
                ))}
                {palette.colors.length > 5 && (
                    <span className="text-[10px] font-mono text-slate-400 py-0.5 px-1">+{palette.colors.length - 5}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
