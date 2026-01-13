import React, { useState } from 'react';
import { AppState, FrameData, GeneratedManual } from './types';
import UploadArea from './components/UploadArea';
import ProcessingStatus from './components/ProcessingStatus';
import ManualEditor from './components/ManualEditor';
import { extractFramesFromVideo } from './services/videoUtils';
import { generateManualFromFrames } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState(0);
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [manual, setManual] = useState<GeneratedManual | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      setAppState(AppState.PROCESSING_VIDEO);
      setError(null);
      setProgress(0);

      // 1. Client-side frame extraction
      // Pass a progress callback
      const extractedFrames = await extractFramesFromVideo(file, (pct) => {
        setProgress(pct);
      });
      
      console.log(`Extracted ${extractedFrames.length} frames`);
      setFrames(extractedFrames);
      
      if (extractedFrames.length === 0) {
        throw new Error("動画からフレームを抽出できませんでした。");
      }

      // 2. Send to Gemini
      setAppState(AppState.ANALYZING_AI);
      setProgress(0); // Reset progress for AI phase (indeterminate or simulated)
      
      const generatedDoc = await generateManualFromFrames(extractedFrames);
      
      setManual(generatedDoc);
      setAppState(AppState.EDITOR);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "予期せぬエラーが発生しました。");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setFrames([]);
    setManual(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Header - Only show if not in editor mode for cleaner workspace */}
      {appState !== AppState.EDITOR && (
        <header className="py-6 px-8 border-b border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                D
             </div>
             <h1 className="text-xl font-bold tracking-tight text-slate-900">DocuFlow AI</h1>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 flex flex-col ${appState === AppState.EDITOR ? 'p-0' : 'p-8'}`}>
        
        {/* State: IDLE */}
        {appState === AppState.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full animate-fade-in">
             <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    画面収録を <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                        完璧なマニュアルへ
                    </span>
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                    業務フローの動画をアップロードしてください。AIが手順を抽出し、説明文を作成し、スクリーンショットを自動生成します。
                    <span className="block mt-2 font-medium text-indigo-600">バックエンド不要。ブラウザで完結します。</span>
                </p>
             </div>
             
             <UploadArea onFileSelect={handleFileSelect} />
             
             <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-500 w-full max-w-3xl">
                <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-600 p-1 rounded">📹</span>
                    <span>MP4, MOV, WebM 対応</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-600 p-1 rounded">⚡</span>
                    <span>Gemini 3.0 Flash 搭載</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-600 p-1 rounded">📄</span>
                    <span>Docs & Markdown 出力</span>
                </div>
             </div>
          </div>
        )}

        {/* State: PROCESSING or ANALYZING */}
        {(appState === AppState.PROCESSING_VIDEO || appState === AppState.ANALYZING_AI) && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <ProcessingStatus state={appState} progress={progress} />
          </div>
        )}

        {/* State: ERROR */}
        {appState === AppState.ERROR && (
           <div className="flex-1 flex flex-col items-center justify-center">
               <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-md">
                   <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                       </svg>
                   </div>
                   <h3 className="text-lg font-bold text-red-900 mb-2">エラーが発生しました</h3>
                   <p className="text-red-700 mb-6">{error}</p>
                   <button 
                    onClick={resetApp}
                    className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                   >
                       もう一度試す
                   </button>
               </div>
           </div>
        )}

        {/* State: EDITOR */}
        {appState === AppState.EDITOR && manual && (
           <ManualEditor 
              manual={manual} 
              frames={frames} 
              onReset={resetApp} 
           />
        )}

      </main>
    </div>
  );
};

export default App;