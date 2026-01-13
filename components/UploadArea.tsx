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
        w-full max-w-2xl mx-auto rounded-xl border-2 border-dashed transition-all duration-300
        flex flex-col items-center justify-center p-12 text-center cursor-pointer
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 shadow-xl scale-[1.01]' 
          : 'border-slate-300 bg-white hover:border-slate-400 shadow-sm'}
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
      
      <div className={`p-4 rounded-full bg-slate-100 mb-4 ${isDragging ? 'bg-indigo-100' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {isDragging ? '動画をドロップ' : '画面収録動画をアップロード'}
      </h3>
      <p className="text-slate-500 mb-6 max-w-sm">
        .mp4, .mov, .webm ファイルをここにドラッグ＆ドロップしてください。解析してマニュアルを生成します。
      </p>
      
      <div className="bg-white border border-slate-200 shadow-sm px-4 py-1 rounded-md text-xs text-slate-500 font-mono">
        推奨: 短い録画（1〜5分程度）
      </div>
    </div>
  );
};

export default UploadArea;