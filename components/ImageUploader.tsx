import React, { useRef, useState } from 'react';
import { MapSelectionOverlay } from './MapSelectionOverlay';
import { createCroppedImage } from '../utils';

interface ImageUploaderProps {
  images: string[];
  onAddImages: (base64s: string[]) => void;
  onRemoveImage: (index: number) => void;
  onAnalyze: () => void;
  onAnalyzeCropped?: (croppedBase64: string) => void;
  disabled: boolean;
  hideAnalyzeButton?: boolean;
  onReset?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  images, 
  onAddImages, 
  onRemoveImage, 
  onAnalyze,
  onAnalyzeCropped,
  disabled,
  hideAnalyzeButton = false,
  onReset
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [cropImageIndex, setCropImageIndex] = useState(0);
  const maxImages = 5;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
  };

  const processFiles = (files: File[]) => {
    if (files.length + images.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please upload valid image files.');
      return;
    }

    const promises = imageFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(base64s => {
      onAddImages(base64s);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const triggerInput = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleSelectionComplete = async (bounds: { x: number; y: number; width: number; height: number }) => {
    if (onAnalyzeCropped && images[cropImageIndex]) {
      try {
        const croppedImage = await createCroppedImage(images[cropImageIndex], bounds);
        onAnalyzeCropped(croppedImage);
        setIsCropping(false);
      } catch (e) {
        console.error("Failed to crop image", e);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
        capture="environment" // Prefer rear camera on mobile
        disabled={disabled}
      />
      
      {/* Cropping View */}
      {isCropping && images.length > 0 && (
        <div className="mb-6 relative w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
           <img 
              src={images[cropImageIndex]} 
              alt="Crop Target" 
              className="w-full h-auto max-h-[60vh] object-contain mx-auto"
           />
           <MapSelectionOverlay 
              onSelectionComplete={handleSelectionComplete}
              onCancel={() => setIsCropping(false)}
           />
           <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
              <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                Draw a box to analyze that specific area
              </span>
           </div>
        </div>
      )}

      {/* Image Gallery Grid (Hidden when cropping) */}
      {!isCropping && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-100">
              <img src={img} alt={`Uploaded ${index}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-start justify-end p-2">
                <button
                  onClick={() => onRemoveImage(index)}
                  className="bg-white/90 text-red-500 hover:text-red-600 hover:bg-white p-2 rounded-full shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all transform md:scale-90 md:group-hover:scale-100"
                  title="Remove image"
                  disabled={disabled}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          {/* Add More Button (thumbnail size) */}
          {images.length < maxImages && (
            <button
              onClick={triggerInput}
              disabled={disabled}
              className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 active:bg-gray-50 active:border-[#1F2937] hover:border-[#1F2937] hover:bg-gray-50 transition-all text-slate-400 hover:text-[#1F2937]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-xs font-medium">Add</span>
            </button>
          )}
        </div>
      )}

      {/* Main Drop Zone (Only if no images) */}
      {images.length === 0 && (
        <div
          onClick={triggerInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
            flex flex-col items-center justify-center min-h-[200px] md:min-h-[240px] active:bg-gray-50
            ${isDragging ? 'border-[#1F2937] bg-gray-50 ring-4 ring-gray-100' : 'border-slate-300 hover:border-[#1F2937] hover:bg-slate-50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className={`p-4 rounded-full bg-slate-100 mb-4 transition-transform group-hover:scale-110 ${isDragging ? 'bg-gray-200 text-[#1F2937]' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <p className="text-lg md:text-xl font-bold text-[#1F2937] text-center">Take Photo or Upload</p>
          <p className="text-sm mt-2 text-slate-400 text-center px-4">Tap here to capture from camera or select files</p>
        </div>
      )}

      {/* Action Bar */}
      {images.length > 0 && !isCropping && (
        <div className="mt-6 flex flex-col items-center gap-3">
          {/* Select Area Button (Visible in Upload and Combined Modes if not hidden) */}
          <button
            onClick={() => {
                setCropImageIndex(0); // Default to first image
                setIsCropping(true);
            }}
            disabled={disabled}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm w-full md:w-auto justify-center
                bg-white text-slate-700 hover:bg-slate-50 border border-slate-200
            `}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Select Area to Analyze
          </button>

          {!hideAnalyzeButton && (
            <div className="flex gap-2 w-full justify-center">
                <button
                    onClick={onAnalyze}
                    disabled={disabled}
                    className="flex-1 md:flex-none md:w-auto bg-[#1F2937] hover:bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Snoop Away
                </button>
                {onReset && (
                    <button
                        onClick={onReset}
                        disabled={disabled}
                        className="px-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50 hover:text-[#1F2937] transition-all shadow-sm"
                        title="Reset"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};