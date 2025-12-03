import React, { useState, useRef } from 'react';
import { Upload, Camera, X, Loader2, Sparkles, AlertCircle, Leaf } from 'lucide-react';
import { analyzePlantImage } from '../services/gemini';
import MarkdownRenderer from './MarkdownRenderer';

const PlantAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to process image to JPEG to ensure API compatibility
  const processImage = (file: File): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Resize if too big (max 1536px) to optimize for API
          let width = img.width;
          let height = img.height;
          const maxDim = 1536; 
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
             reject(new Error("Could not get canvas context"));
             return;
          }
          
          // Fill white background (transparency fix)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Always convert to JPEG for broad API support
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = dataUrl.split(',')[1];
          resolve({ base64, mimeType: 'image/jpeg' });
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size too large. Please choose an image under 10MB.");
        return;
      }

      try {
        setError(null);
        setAnalysis(null);
        // Show loading state implicitly by setting image immediately? 
        // No, let's process first.
        
        const processed = await processImage(file);
        setSelectedImage(processed.base64);
        setMimeType(processed.mimeType);
      } catch (err) {
        console.error(err);
        setError("Failed to process image. Please try a different photo.");
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzePlantImage(selectedImage, mimeType);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setAnalysis(null);
    setError(null);
    setMimeType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
      <div className="bg-emerald-600 p-4 text-white">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Camera size={24} />
          Plant Identifier
        </h2>
        <p className="text-emerald-100 text-xs">Snap a photo to get care tips</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {!selectedImage ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse-slow">
              <Leaf className="text-emerald-600 w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Identify Your Plant</h3>
              <p className="text-gray-500 max-w-xs mx-auto mb-6">
                Upload a clear photo of leaves or flowers to get instant identification and care instructions.
              </p>
              
              <button 
                onClick={triggerFileInput}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
              >
                <Upload size={20} />
                Upload Photo
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-md bg-gray-100 border border-gray-200">
              <img 
                src={`data:${mimeType};base64,${selectedImage}`} 
                alt="Selected plant" 
                className="w-full h-auto max-h-[400px] object-contain mx-auto"
              />
              <button
                onClick={reset}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>

            {!analysis && !isAnalyzing && (
              <div className="flex justify-center">
                 <button 
                  onClick={handleAnalyze}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl transition-all shadow-md font-medium text-lg"
                >
                  <Sparkles size={20} />
                  Analyze Plant
                </button>
              </div>
            )}

            {isAnalyzing && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-emerald-800 font-medium">Analyzing leaf patterns...</p>
                <p className="text-emerald-600 text-sm">Consulting the botanical database</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <p>{error}</p>
              </div>
            )}

            {analysis && (
              <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                  <Sparkles className="text-amber-400" size={20} />
                  <h3 className="font-semibold text-lg text-emerald-900">Analysis Result</h3>
                </div>
                <div className="prose prose-emerald max-w-none">
                  <MarkdownRenderer content={analysis} />
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button 
                    onClick={reset}
                    className="text-sm text-gray-500 hover:text-emerald-600 font-medium flex items-center gap-1 transition-colors"
                  >
                    <Camera size={16} />
                    Analyze another plant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantAnalyzer;