
import React, { useState, useRef } from 'react';
import { Camera, Wand2, RefreshCw, X } from 'lucide-react';
import { editImageWithAI } from '../services/geminiService';

const AIStyler: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    const base64 = image.split(',')[1];
    const result = await editImageWithAI(base64, prompt, mimeType);
    if (result) {
      setImage(result);
    }
    setLoading(false);
  };

  return (
    <div className="washi-card p-6 rounded-3xl mb-6">
      <h2 className="text-lg font-medium text-[#78716c] mb-4 flex items-center gap-2">
        <Wand2 size={20} /> AI 投資視覺風格化
      </h2>
      
      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#e7e5e4] rounded-2xl h-48 flex flex-col items-center justify-center text-[#a8a29e] hover:bg-[#fafaf9] cursor-pointer transition-colors"
        >
          <Camera size={32} className="mb-2" />
          <p className="text-sm">上傳資產截圖或卡片來進行 AI 修圖</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
            <img src={image} alt="Original" className="max-h-full object-contain" />
            <button 
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X size={16} />
            </button>
            {loading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                <RefreshCw className="animate-spin text-[#a8a29e]" size={32} />
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="輸入指令，如：'加上復古濾鏡' 或 '移除背景'"
              className="flex-1 p-3 rounded-xl border border-[#e7e5e4] text-sm focus:outline-none focus:ring-1 focus:ring-[#d6d3d1]"
            />
            <button 
              onClick={handleEdit}
              disabled={loading || !prompt}
              className="px-4 py-2 bg-[#a8a29e] text-white rounded-xl disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
            </button>
          </div>
          <p className="text-[10px] text-[#a8a29e] text-center">Powered by Gemini 2.5 Flash Image</p>
        </div>
      )}
    </div>
  );
};

export default AIStyler;
