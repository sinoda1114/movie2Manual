import React, { useCallback, useState } from 'react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      } else {
        alert("有効な動画ファイルをドロップしてください。");
      }
    }
  }, [onFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`
        w-full mx-auto rounded-2xl border-2 border-dashed transition-all duration-300
        flex flex-col items-center justify-center p-16 text-center cursor-pointer
        backdrop-blur-sm
        ${isDragging 
          ? 'border-indigo-400 bg-indigo-50/80 shadow-2xl scale-[1.02] ring-4 ring-indigo-100' 
          : 'border-slate-300/60 bg-white/80 hover:border-indigo-300 hover:bg-indigo-50/50 shadow-lg hover:shadow-xl'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input 
        type="file" 
        id="fileInput" 
        className="hidden" 
        accept="video/*" 
        onChange={handleInputChange} 
      />
      
      <div className={`p-5 rounded-2xl mb-6 transition-all duration-300 ${isDragging ? 'bg-gradient-to-br from-indigo-100 to-purple-100 scale-110' : 'bg-gradient-to-br from-slate-50 to-indigo-50'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 transition-colors duration-300 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-3">
        {isDragging ? '動画をドロップ' : '画面収録動画をアップロード'}
      </h3>
      <p className="text-slate-600 mb-8 max-w-md text-lg leading-relaxed">
        .mp4, .mov, .webm ファイルをここにドラッグ＆ドロップしてください。解析してマニュアルを生成します。
      </p>
      
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 shadow-sm px-5 py-2 rounded-full text-sm text-slate-600 font-medium">
        推奨: 短い録画（1〜5分程度）
      </div>
    </div>
  );
};

export default UploadArea;