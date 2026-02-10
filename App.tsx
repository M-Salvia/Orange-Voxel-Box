
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState } from 'react';
import { VoxelEngine } from './services/VoxelEngine';
import { UIOverlay } from './components/UIOverlay';
import { JsonModal } from './components/JsonModal';
import { PromptModal } from './components/PromptModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LiquidOrangeTimer } from './components/LiquidOrangeTimer';
import { Generators } from './utils/voxelGenerators';
import { AppState, VoxelData } from './types';
import { GoogleGenAI, Type } from "@google/genai";

const FOCUS_DURATION = 2700; // 45 minutes

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxelEngine | null>(null);
  
  const [appState, setAppState] = useState<AppState>(AppState.STABLE);
  const [voxelCount, setVoxelCount] = useState<number>(0);
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonModalMode, setJsonModalMode] = useState<'view' | 'import'>('view');
  
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<'create' | 'morph'>('create');
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [jsonData, setJsonData] = useState('');
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  const [currentModelData, setCurrentModelData] = useState<VoxelData[] | null>(null);

  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new VoxelEngine(
      containerRef.current,
      (newState) => setAppState(newState),
      (count) => setVoxelCount(count),
      (enabled) => setIsAutoRotate(enabled)
    );

    engineRef.current = engine;
    engine.initOrangeEnvironment();
    
    const initialData = Generators.OrangeHarvest(0, "0");
    engine.loadInitialModel(initialData, 0);

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.cleanup();
    };
  }, []);

  useEffect(() => {
    let interval: number;
    if (appState === AppState.TIMING && !isTimerPaused && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appState, isTimerPaused, timeLeft]);

  useEffect(() => {
    if (appState === AppState.TIMING && timeLeft === 0) {
      setAppState(AppState.COLLECTING);
    }
  }, [timeLeft, appState]);

  const handleDismantle = () => {
    engineRef.current?.dismantle();
  };

  const handleStartTimer = () => {
    setAppState(AppState.TIMING);
    setTimeLeft(FOCUS_DURATION);
    setIsTimerPaused(false);
  };

  const handleQuitTimer = () => {
    setAppState(AppState.STABLE);
  };

  const handleCollect = () => {
    const newCount = voxelCount + 1;
    setVoxelCount(newCount);
    setAppState(AppState.STABLE);
    
    if (engineRef.current) {
      if (currentModelData) {
        engineRef.current.rebuild(currentModelData);
      } else {
        engineRef.current.loadInitialModel(Generators.OrangeHarvest(newCount, String(newCount)), newCount);
      }
    }
  };

  const handleTogglePauseTimer = () => {
    setIsTimerPaused(!isTimerPaused);
  };

  const handleOrangeRebuild = () => {
      setCurrentModelData(null); 
      if (engineRef.current) {
          engineRef.current.rebuild(Generators.OrangeHarvest(voxelCount, String(voxelCount)));
      }
  };

  const handleShowJson = () => {
    if (engineRef.current) {
      setJsonData(engineRef.current.getJsonData());
      setJsonModalMode('view');
      setIsJsonModalOpen(true);
    }
  };

  const handleImportClick = () => {
      setJsonModalMode('import');
      setIsJsonModalOpen(true);
  };

  const handleJsonImport = (jsonStr: string) => {
      try {
          const rawData = JSON.parse(jsonStr);
          const importedData: VoxelData[] = rawData.map((v: any) => ({
              x: Number(v.x) || 0,
              y: Number(v.y) || 0,
              z: Number(v.z) || 0,
              color: 0xFF8C00
          }));
          
          setCurrentModelData(importedData);
          engineRef.current?.rebuild(importedData);
      } catch (e) {
          alert(language === 'zh' ? "导入失败，JSON 格式不正确。" : "Import failed, invalid JSON format.");
      }
  };

  const openPrompt = (mode: 'create' | 'morph') => {
      setPromptMode(mode);
      setIsPromptModalOpen(true);
  }
  
  const handleToggleRotation = () => {
      const nextState = !isAutoRotate;
      setIsAutoRotate(nextState);
      engineRef.current?.setAutoRotate(nextState);
  }

  const handlePromptSubmit = async (prompt: string) => {
    setIsGenerating(true);
    setIsPromptModalOpen(false);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = language === 'zh' 
            ? `你是一个3D体素艺术家。请根据提示语 "${prompt}" 生成一个3D模型。我有正好 ${voxelCount} 个橘子。请仅返回包含 {x, y, z} 坐标的 JSON 数组。`
            : `You are a 3D voxel artist. Generate a model for: "${prompt}". I have exactly ${voxelCount} oranges. Return ONLY a JSON array of {x, y, z} coordinates.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: systemInstruction,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.INTEGER },
                            y: { type: Type.INTEGER },
                            z: { type: Type.INTEGER }
                        },
                        required: ["x", "y", "z"]
                    }
                }
            }
        });
        if (response.text) {
            const voxelData: VoxelData[] = JSON.parse(response.text.trim()).map((v: any) => ({
                x: v.x, y: v.y, z: v.z,
                color: 0xFF8C00
            }));
            
            setCurrentModelData(voxelData);
            engineRef.current?.rebuild(voxelData);
        }
    } finally {
        setIsGenerating(false);
    }
  };

  const isTimingOrCollecting = appState === AppState.TIMING || appState === AppState.COLLECTING;
  const progress = appState === AppState.COLLECTING ? 1 : (FOCUS_DURATION - timeLeft) / FOCUS_DURATION;

  return (
    <div className="relative w-full h-screen bg-[#f8f6ef] overflow-hidden transition-colors duration-1000">
      <div 
        ref={containerRef} 
        className={`absolute inset-0 z-0 transition-all duration-1000 ${isTimingOrCollecting ? 'opacity-0 scale-150 blur-[100px]' : 'opacity-100 scale-100'}`} 
      />
      
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 bg-gradient-to-br from-[#fdfcf7] via-[#f7eee1] to-[#f5e3cc] ${isTimingOrCollecting ? 'opacity-100' : 'opacity-0'}`} />

      {isTimingOrCollecting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
           <div className="pointer-events-auto mt-[-80px]">
             <LiquidOrangeTimer progress={progress} isPaused={isTimerPaused || appState === AppState.COLLECTING} />
           </div>
        </div>
      )}

      <UIOverlay 
        voxelCount={voxelCount}
        appState={appState}
        language={language}
        onLanguageChange={setLanguage}
        currentBaseModel={currentModelData ? (language === 'zh' ? "AI 雕塑" : "AI Sculpture") : (language === 'zh' ? "原始橘子" : "Original Oranges")}
        isAutoRotate={isAutoRotate}
        isInfoVisible={showWelcome}
        isGenerating={isGenerating}
        timeLeft={timeLeft}
        isTimerPaused={isTimerPaused}
        onDismantle={handleDismantle}
        onOrangeRebuild={handleOrangeRebuild}
        onPromptCreate={() => openPrompt('create')}
        onShowJson={handleShowJson}
        onImportJson={handleImportClick}
        onToggleRotation={handleToggleRotation}
        onToggleInfo={() => setShowWelcome(!showWelcome)}
        onStartTimer={handleStartTimer}
        onQuitTimer={handleQuitTimer}
        onCollect={handleCollect}
        onTogglePauseTimer={handleTogglePauseTimer}
      />

      <WelcomeScreen visible={showWelcome} language={language} onClose={() => setShowWelcome(false)} />
      <JsonModal language={language} isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} data={jsonData} isImport={jsonModalMode === 'import'} onImport={handleJsonImport} />
      <PromptModal language={language} isOpen={isPromptModalOpen} mode={promptMode} onClose={() => setIsPromptModalOpen(false)} onSubmit={handlePromptSubmit} />
    </div>
  );
};

export default App;
