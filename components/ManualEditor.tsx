import React, { useState } from 'react';
import { GeneratedManual, FrameData, ManualStep } from '../types';
import Button from './Button';
import { exportToWord } from '../services/exportService';

interface ManualEditorProps {
  manual: GeneratedManual;
  frames: FrameData[];
  onReset: () => void;
}

const ManualEditor: React.FC<ManualEditorProps> = ({ manual, frames, onReset }) => {
  const [editedManual, setEditedManual] = useState<GeneratedManual>(manual);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Update a specific step's text
  const updateStep = (index: number, field: keyof ManualStep, value: string) => {
    const newSteps = [...editedManual.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setEditedManual({ ...editedManual, steps: newSteps });
  };

  const updateHeader = (field: 'title' | 'overview', value: string) => {
    setEditedManual({ ...editedManual, [field]: value });
  };

  const getStepImage = (frameIndex: number) => {
    const frame = frames[frameIndex];
    return frame ? frame.dataUrl : null;
  };

  const handleWordExport = async () => {
    try {
      setIsExporting(true);
      await exportToWord(editedManual, frames);
    } catch (e) {
      console.error(e);
      alert('Wordファイルの生成に失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-[90vh]">
      {/* Toolbar */}
      <div className="toolbar-area bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
        <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2">
            <input 
                type="text" 
                value={editedManual.title}
                onChange={(e) => updateHeader('title', e.target.value)}
                className="text-xl font-bold text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 rounded px-1 -ml-1 w-full truncate"
            />
           </div>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-3 shrink-0">
            <Button variant="outline" size="sm" onClick={onReset}>リセット</Button>
            
            <Button variant="primary" size="sm" onClick={handleWordExport} isLoading={isExporting} icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            }>
                Wordへ出力
            </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-slate-50 p-6 md:p-8">
        <div className="print-container max-w-4xl mx-auto bg-white shadow-sm border border-slate-200 rounded-xl min-h-full p-8 md:p-12">
          
          {/* Doc Header */}
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{editedManual.title}</h1>
            <textarea
                className="w-full text-slate-600 bg-transparent border-0 resize-none focus:ring-0 p-0 text-base"
                rows={2}
                value={editedManual.overview}
                onChange={(e) => updateHeader('overview', e.target.value)}
            />
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {editedManual.steps.map((step, index) => {
              const imageUrl = getStepImage(step.frameIndex);
              
              return (
                <div 
                    key={index} 
                    className={`step-item group relative rounded-lg p-2 -m-2 transition-colors ${activeStepIndex === index ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                    onClick={() => setActiveStepIndex(index)}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-sm mt-1 print:bg-black print:text-white">
                        {index + 1}
                    </div>
                    
                    <div className="flex-1 space-y-4">
                        {/* Step Title Input */}
                        <input
                            type="text"
                            value={step.title}
                            onChange={(e) => updateStep(index, 'title', e.target.value)}
                            className="w-full font-bold text-lg text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-300"
                            placeholder="手順のタイトル"
                        />
                        
                        {/* Image */}
                        {imageUrl && (
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-video bg-slate-100 print:shadow-none print:border-none">
                                <img 
                                    src={imageUrl} 
                                    alt={`Step ${index + 1}`} 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}

                        {/* Description */}
                         <textarea
                            className="w-full text-slate-600 bg-transparent border-0 resize-none focus:ring-0 p-0 text-base"
                            rows={Math.max(2, Math.ceil(step.description.length / 40))}
                            value={step.description}
                            onChange={(e) => updateStep(index, 'description', e.target.value)}
                            placeholder="この手順の説明..."
                        />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ManualEditor;