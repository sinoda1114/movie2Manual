import React, { useEffect, useState } from 'react';
import { AppState } from '../types';

interface ProcessingStatusProps {
  state: AppState;
  progress: number; // 0-100
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ state, progress }) => {
  const [dots, setDots] = useState('');

  // Animated dots for lively text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getStatusText = () => {
    if (state === AppState.PROCESSING_VIDEO) return `動画フレームをスキャン中${dots}`;
    if (state === AppState.ANALYZING_AI) return `マニュアルを作成中${dots}`;
    return '処理中...';
  };

  const getSubText = () => {
    if (state === AppState.PROCESSING_VIDEO) return "録画から視覚情報を抽出しています。";
    if (state === AppState.ANALYZING_AI) return "ワークフローを解析し、手順を生成しています。";
    return "";
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-lg border border-slate-100 p-8 text-center">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <svg className="animate-spin w-full h-full text-indigo-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2 min-h-[32px]">
        {getStatusText()}
      </h3>
      <p className="text-slate-500 text-sm">
        {getSubText()}
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 mt-6 overflow-hidden">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${state === AppState.ANALYZING_AI ? Math.max(progress, 80) : progress}%` }} // Fake progress for AI step if needed
        ></div>
      </div>
    </div>
  );
};

export default ProcessingStatus;