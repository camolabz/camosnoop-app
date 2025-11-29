import React, { useState } from 'react';

interface LocationInputProps {
  onSearch: (location: string) => void;
  disabled: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({ onSearch, disabled }) => {
  const [location, setLocation] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && !disabled) {
      onSearch(location);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude},${position.coords.longitude}`;
        setLocation(coords);
        onSearch(coords); // Auto-submit on success for speed
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location. Please ensure location services are enabled.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={disabled || isLocating}
          placeholder="Address or Coordinates"
          className="w-full pl-12 pr-[140px] py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg shadow-sm focus:outline-none focus:border-[#1F2937] focus:ring-4 focus:ring-gray-200 transition-all placeholder:text-slate-300 text-slate-700 appearance-none"
        />
        
        <div className="absolute right-2 top-2 bottom-2 flex gap-1">
          {/* Geolocation Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={disabled || isLocating}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl transition-colors border border-slate-200"
            title="Use Current Location"
          >
             {isLocating ? (
               <div className="w-5 h-5 border-2 border-[#1F2937] border-t-transparent rounded-full animate-spin"></div>
             ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
             )}
          </button>

          {/* Search Button */}
          <button
            type="submit"
            disabled={disabled || !location.trim()}
            className="bg-[#1F2937] hover:bg-gray-900 disabled:bg-slate-300 text-white px-4 md:px-6 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <span className="hidden md:inline">Search</span>
            <span className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 005.196 5.196z" />
              </svg>
            </span>
          </button>
        </div>
      </form>
      <p className="text-center text-xs text-slate-400 mt-3">
        Tip: Tap the location pin to use GPS coordinates.
      </p>
    </div>
  );
};