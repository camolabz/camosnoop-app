import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageUploader } from './components/ImageUploader';
import { LocationInput } from './components/LocationInput';
import { PaletteDisplay } from './components/PaletteDisplay';
import { MapSelectionOverlay } from './components/MapSelectionOverlay';
import { FAQPage } from './components/FAQPage';
import { LegalPage } from './components/LegalPage';
import { extractColorsFromImage, extractColorsFromLocation, extractColorsFromHybrid, extractColorsFromStreetLocation, getCoordinatesFromLocation } from './services/geminiService';
import { AppState, ColorItem, SavedPalette } from './types';
import { processResponseColors, decodePalette } from './utils';

type InputMode = 'upload' | 'location' | 'street' | 'combined';
type ViewMode = 'home' | 'faq' | 'legal';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [mapCoordinates, setMapCoordinates] = useState<string>('');
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);

  // Load saved palettes from local storage on mount
  useEffect(() => {
    const storedPalettes = localStorage.getItem('camosnoop_palettes');
    if (storedPalettes) {
      try {
        setSavedPalettes(JSON.parse(storedPalettes));
      } catch (e) {
        console.error("Failed to parse saved palettes", e);
      }
    }
  }, []);

  // Check URL for shared palette
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedPalette = params.get('palette');
    if (sharedPalette) {
       const rawColors = decodePalette(sharedPalette);
       if (rawColors.length > 0) {
          const processed = processResponseColors(rawColors); // Ensure matches are calculated
          setColors(processed);
          setAppState(AppState.SUCCESS);
          // Clear URL without reload
          window.history.replaceState({}, '', window.location.pathname);
       }
    }
  }, []);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setSelectedImages([]);
    setCurrentLocation('');
    setMapCoordinates('');
    setColors([]);
    setErrorMessage(null);
    setIsSelectionMode(false);
    setViewMode('home'); // Ensure we go back to home view
  };

  // Add images to state
  const handleAddImages = (newImages: string[]) => {
    setSelectedImages(prev => [...prev, ...newImages]);
    setErrorMessage(null);
    if (appState === AppState.SUCCESS && inputMode === 'upload') {
        setAppState(AppState.IDLE);
    }
  };

  // Remove single image
  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Trigger analysis for uploaded images
  const handleAnalyzeImages = async () => {
    if (selectedImages.length === 0) return;
    
    setAppState(AppState.ANALYZING);
    setErrorMessage(null);
    setColors([]);
    setLoadingMessage(selectedImages.length > 1 ? "Analyzing unified mood board..." : "Analyzing image composition...");

    try {
      const response = await extractColorsFromImage(selectedImages);
      const processedColors = processResponseColors(response.palette);
      setColors(processedColors);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to extract colors. Please check your API key or try different images.");
      setAppState(AppState.ERROR);
    }
  };

  // Analyze a cropped specific area of an uploaded image
  const handleImageCropAnalysis = async (croppedBase64: string) => {
     setAppState(AppState.ANALYZING);
     setErrorMessage(null);
     setColors([]);
     
     if (inputMode === 'combined' && currentLocation) {
         // Hybrid analysis using the cropped image as specific inspiration
         setLoadingMessage("Synthesizing selected detail with site context...");
         try {
             const response = await extractColorsFromHybrid([croppedBase64], currentLocation);
             const processedColors = processResponseColors(response.palette);
             setColors(processedColors);
             setAppState(AppState.SUCCESS);
         } catch (error) {
             console.error(error);
             setErrorMessage("Failed to perform hybrid analysis on cropped area.");
             setAppState(AppState.ERROR);
         }
     } else {
         // Standard image analysis on the crop
         setLoadingMessage("Analyzing selected area...");
         try {
             const response = await extractColorsFromImage([croppedBase64]);
             const processedColors = processResponseColors(response.palette);
             setColors(processedColors);
             setAppState(AppState.SUCCESS);
         } catch (error) {
             console.error(error);
             setErrorMessage("Failed to analyze selected area.");
             setAppState(AppState.ERROR);
         }
     }
  };

  const handleLocationSearch = async (location: string) => {
    setCurrentLocation(location);
    setMapCoordinates(''); // Reset coordinates until fetched
    
    // In combined mode, we don't auto-analyze when location changes
    if (inputMode === 'combined') {
        return;
    }

    setAppState(AppState.ANALYZING);
    setErrorMessage(null);
    setColors([]);
    setIsSelectionMode(false);
    
    try {
      if (inputMode === 'street') {
         setLoadingMessage(`Locating street view for ${location}...`);
         // Get coordinates first for reliable street view embedding and analysis
         const coords = await getCoordinatesFromLocation(location);
         setMapCoordinates(coords);
         
         setLoadingMessage(`Analyzing street-level visuals...`);
         const response = await extractColorsFromStreetLocation(location);
         const processedColors = processResponseColors(response.palette);
         setColors(processedColors);
      } else {
         setLoadingMessage(`Analyzing satellite imagery for ${location}...`);
         const response = await extractColorsFromLocation(location);
         const processedColors = processResponseColors(response.palette);
         setColors(processedColors);
      }
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to analyze location. Please try a more specific address.");
      setAppState(AppState.ERROR);
    }
  };

  const handleHybridAnalysis = async () => {
    if (selectedImages.length === 0) {
        setErrorMessage("Please upload at least one image.");
        return;
    }
    if (!currentLocation) {
        setErrorMessage("Please enter a location.");
        return;
    }

    setAppState(AppState.ANALYZING);
    setErrorMessage(null);
    setColors([]);
    setLoadingMessage("Synthesizing reference images with site context...");

    try {
        const response = await extractColorsFromHybrid(selectedImages, currentLocation);
        const processedColors = processResponseColors(response.palette);
        setColors(processedColors);
        setAppState(AppState.SUCCESS);
    } catch (error) {
        console.error(error);
        setErrorMessage("Failed to perform hybrid analysis.");
        setAppState(AppState.ERROR);
    }
  };

  const handleMapSelection = async (bounds: { x: number, y: number, width: number, height: number }) => {
    if (!currentLocation) return;
    
    setAppState(AppState.ANALYZING);
    
    // Calculate focus description
    const relativeX = bounds.x + (bounds.width / 2) - 50; 
    const relativeY = bounds.y + (bounds.height / 2) - 50; 
    
    let direction = "center";
    const distance = Math.sqrt(relativeX*relativeX + relativeY*relativeY);
    
    if (distance > 10) {
      const angle = Math.atan2(relativeY, relativeX) * 180 / Math.PI;
      if (angle >= -22.5 && angle < 22.5) direction = "East";
      else if (angle >= 22.5 && angle < 67.5) direction = "South-East";
      else if (angle >= 67.5 && angle < 112.5) direction = "South";
      else if (angle >= 112.5 && angle < 157.5) direction = "South-West";
      else if (angle >= 157.5 || angle < -157.5) direction = "West";
      else if (angle >= -157.5 && angle < -112.5) direction = "North-West";
      else if (angle >= -112.5 && angle < -67.5) direction = "North";
      else if (angle >= -67.5 && angle < -22.5) direction = "North-East";
    }
    
    const focusDescription = `the area approximately ${Math.round(distance)} meters ${direction} of the center coordinates`;

    try {
      if (inputMode === 'combined' && selectedImages.length > 0) {
         setLoadingMessage("Synthesizing images with selected map area...");
         const response = await extractColorsFromHybrid(selectedImages, currentLocation, focusDescription);
         const processedColors = processResponseColors(response.palette);
         setColors(processedColors);
      } else if (inputMode === 'street') {
         setLoadingMessage("Analyzing selected street-level details...");
         const response = await extractColorsFromStreetLocation(currentLocation, focusDescription);
         const processedColors = processResponseColors(response.palette);
         setColors(processedColors);
      } else {
         setLoadingMessage("Analyzing selected map area...");
         const response = await extractColorsFromLocation(currentLocation, focusDescription);
         const processedColors = processResponseColors(response.palette);
         setColors(processedColors);
      }
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to analyze selection.");
      setAppState(AppState.ERROR);
    }
  };

  const switchMode = (mode: InputMode) => {
    if (appState === AppState.ANALYZING) return;
    setInputMode(mode);
    setErrorMessage(null);
    setIsSelectionMode(false);
  };

  // Determine map source based on mode
  const getMapSrc = () => {
    if (!currentLocation) return '';
    
    if (inputMode === 'street') {
       const locationParam = mapCoordinates || currentLocation;
       return `https://www.google.com/maps/embed/v1/streetview?key=${process.env.API_KEY}&location=${encodeURIComponent(locationParam)}`;
    }

    const encoded = encodeURIComponent(currentLocation);
    const mapType = 'k'; // k = satellite
    return `https://www.google.com/maps?q=${encoded}&t=${mapType}&z=19&ie=UTF8&iwloc=&output=embed`;
  };

  const getExternalMapLink = () => {
      const encoded = encodeURIComponent(currentLocation);
      if (inputMode === 'street') {
          if (mapCoordinates) {
              return `https://www.google.com/maps?q=${mapCoordinates}&layer=c&cbll=${mapCoordinates}`;
          }
          return `https://www.google.com/maps?q=${encoded}&layer=c&cbll=0,0`;
      }
      return `https://www.google.com/maps?q=${encoded}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onReset={handleReset} />
      
      {/* --- CONTENT AREA SWITCHER --- */}
      
      {viewMode === 'faq' && <FAQPage />}
      
      {viewMode === 'legal' && <LegalPage />}
      
      {viewMode === 'home' && (
        <main className="flex-grow px-4 py-6 md:py-12 flex flex-col items-center">
          <div className="text-center max-w-2xl mb-8">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              See the Invisible. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1F2937] to-black">Create the Unseen.</span>
            </h2>
            <p className="text-base md:text-lg text-slate-600">
              Generate a harmonious color palette from images, locations, or a fusion of both.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 mb-8 w-full max-w-2xl mx-auto shadow-inner overflow-x-auto">
            <button
              onClick={() => switchMode('upload')}
              className={`flex-1 min-w-[100px] py-3 md:py-2 px-2 rounded-lg text-sm font-semibold transition-all duration-200 truncate ${
                inputMode === 'upload' 
                  ? 'bg-white text-[#1F2937] shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              disabled={appState === AppState.ANALYZING}
            >
              Camera/Upload
            </button>
            <button
              onClick={() => switchMode('location')}
              className={`flex-1 min-w-[80px] py-3 md:py-2 px-2 rounded-lg text-sm font-semibold transition-all duration-200 truncate ${
                inputMode === 'location' 
                  ? 'bg-white text-[#1F2937] shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              disabled={appState === AppState.ANALYZING}
            >
              Satellite
            </button>
            
            {/* Street View Toggle (Hidden by request, but logic remains) */}
            {/* 
            <button
              onClick={() => switchMode('street')}
              className={`flex-1 min-w-[80px] py-3 md:py-2 px-2 rounded-lg text-sm font-semibold transition-all duration-200 truncate ${
                inputMode === 'street' 
                  ? 'bg-white text-[#1F2937] shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              disabled={appState === AppState.ANALYZING}
            >
              Street View
            </button> 
            */}
            
            <button
              onClick={() => switchMode('combined')}
              className={`flex-1 min-w-[70px] py-3 md:py-2 px-2 rounded-lg text-sm font-semibold transition-all duration-200 truncate ${
                inputMode === 'combined' 
                  ? 'bg-white text-[#1F2937] shadow-sm ring-1 ring-black/5' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              disabled={appState === AppState.ANALYZING}
            >
              Hybrid
            </button>
          </div>

          <div className="w-full transition-all duration-300 flex flex-col items-center">
            
            {/* 1. IMAGE SECTION */}
            {(inputMode === 'upload' || inputMode === 'combined') && (
               <div className="w-full">
                  {inputMode === 'combined' && (
                      <h3 className="text-center text-slate-500 font-bold uppercase tracking-wider text-xs mb-4">Step 1: Capture or Upload</h3>
                  )}
                  <ImageUploader 
                    images={selectedImages}
                    onAddImages={handleAddImages}
                    onRemoveImage={handleRemoveImage}
                    onAnalyze={handleAnalyzeImages}
                    onAnalyzeCropped={handleImageCropAnalysis}
                    disabled={appState === AppState.ANALYZING}
                    hideAnalyzeButton={inputMode === 'combined'}
                    onReset={handleReset}
                  />
               </div>
            )}

            {/* 2. LOCATION SECTION */}
            {(inputMode === 'location' || inputMode === 'street' || inputMode === 'combined') && (
              <div className="w-full max-w-2xl">
                 {inputMode === 'combined' && (
                      <h3 className="text-center text-slate-500 font-bold uppercase tracking-wider text-xs mb-4 border-t border-slate-200 pt-6">Step 2: Site Location</h3>
                 )}
                 
                 {currentLocation && (
                   <div className="w-full mx-auto mb-6 relative">
                     <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 relative aspect-video group">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight={0}
                          marginWidth={0}
                          src={getMapSrc()}
                          title="Location View"
                          className={`w-full h-full ${isSelectionMode ? 'pointer-events-none' : ''}`}
                          loading="lazy"
                          allowFullScreen
                        ></iframe>
                        
                        <div className="absolute bottom-2 right-2 flex items-center gap-2 z-10 pointer-events-none">
                          <div className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                             {inputMode === 'street' ? 'Interactive Street View' : 'Live Satellite View'}
                          </div>
                        </div>
                        
                        <a 
                          href={getExternalMapLink()}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-lg transition-colors z-10"
                          title="Open in Google Maps"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                        
                        {inputMode === 'street' && (
                          <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                               <a 
                                  href={getExternalMapLink()}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="pointer-events-auto bg-white/90 text-[#1F2937] px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-white hover:scale-105 transition-all flex items-center gap-2"
                               >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                  </svg>
                                  Open Interactive Street View
                               </a>
                          </div>
                        )}

                        {isSelectionMode && inputMode !== 'street' && (
                          <MapSelectionOverlay 
                            onSelectionComplete={handleMapSelection}
                            onCancel={() => setIsSelectionMode(false)}
                          />
                        )}
                     </div>
                     
                     {inputMode !== 'street' && (
                       <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => setIsSelectionMode(!isSelectionMode)}
                            className={`
                              flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm w-full md:w-auto justify-center
                              ${isSelectionMode 
                                ? 'bg-gray-100 text-[#1F2937] ring-2 ring-[#1F2937] ring-offset-1' 
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'}
                            `}
                            disabled={appState === AppState.ANALYZING}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            {isSelectionMode ? 'Cancel Selection' : 'Select Area to Analyze'}
                          </button>
                       </div>
                     )}
                   </div>
                 )}
                 
                 <LocationInput 
                   onSearch={handleLocationSearch}
                   disabled={appState === AppState.ANALYZING}
                 />
              </div>
            )}

            {/* 3. COMBINED ACTION */}
            {inputMode === 'combined' && (
              <div className="mt-2 mb-8 flex flex-col items-center w-full gap-4">
                   <div className="flex gap-2 w-full justify-center">
                      <button
                          onClick={handleHybridAnalysis}
                          disabled={appState === AppState.ANALYZING || selectedImages.length === 0 || !currentLocation}
                          className="w-full md:w-auto bg-[#1F2937] hover:bg-gray-900 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                      >
                          Snoop Away
                      </button>
                      <button
                          onClick={handleReset}
                          disabled={appState === AppState.ANALYZING}
                          className="px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 hover:text-[#1F2937] transition-all shadow-sm"
                          title="Reset"
                      >
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>
                      </button>
                   </div>
                   {(selectedImages.length === 0 || !currentLocation) && (
                       <p className="text-xs text-slate-400 text-center px-4">Take a photo and set a location to enable</p>
                   )}
              </div>
            )}
          </div>

          {appState === AppState.ANALYZING && (
            <div className="mt-2 flex flex-col items-center animate-pulse px-4 text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1F2937] rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-medium">{loadingMessage}</p>
            </div>
          )}

          {appState === AppState.ERROR && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center max-w-md mx-4">
              <p className="font-bold">Error</p>
              <p className="text-sm mt-1">{errorMessage}</p>
              <button 
                onClick={() => setAppState(AppState.IDLE)}
                className="mt-3 text-xs uppercase tracking-wider font-bold hover:underline"
              >
                Try Again
              </button>
            </div>
          )}

          {appState === AppState.SUCCESS && (
            <div className="w-full mt-8">
              <PaletteDisplay colors={colors} />
            </div>
          )}

        </main>
      )}

      <Footer onNavigate={setViewMode} />
    </div>
  );
};

export default App;