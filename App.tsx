
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
import { AuthModal } from './components/AuthModal';
import { Generators } from './utils/voxelGenerators';
import { AppState, VoxelData } from './types';
import { supabase } from './services/supabaseClient';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<'create' | 'morph'>('create');
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [currentModelData, setCurrentModelData] = useState<VoxelData[] | null>(null);
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [user, setUser] = useState<any>(null);

  // 1. 初始化 Auth 监听和数据拉取
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserOranges(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserOranges(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserOranges = async (currentUser: any) => {
    const userId = currentUser.id;
    // 尝试获取 profile
    const { data, error } = await supabase
      .from('profiles')
      .select('orange_count, username')
      .eq('id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // 如果没有找到记录，说明是新用户，创建一个
      const initialUsername = currentUser.user_metadata?.username || currentUser.email?.split('@')[0];
      const { data: newData, error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId, orange_count: 0, username: initialUsername }])
        .select()
        .single();
      
      if (!insertError && newData) {
        setVoxelCount(newData.orange_count);
        updateEngineModel(newData.orange_count);
      }
    } else if (data && !error) {
      setVoxelCount(data.orange_count);
      updateEngineModel(data.orange_count);
    }
  };

  const updateEngineModel = (count: number) => {
    if (engineRef.current) {
      engineRef.current.loadInitialModel(Generators.OrangeHarvest(count, String(count)), count);
    }
  };

  // 2. 初始化引擎
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
    engine.loadInitialModel(Generators.OrangeHarvest(voxelCount, String(voxelCount)), voxelCount);

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      engine.cleanup();
    };
  }, []);

  // 3. 计时逻辑
  useEffect(() => {
    let interval: number;
    if (appState === AppState.TIMING && !isTimerPaused && timeLeft > 0) {
      interval = window.setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [appState, isTimerPaused, timeLeft]);

  useEffect(() => {
    if (appState === AppState.TIMING && timeLeft === 0) setAppState(AppState.COLLECTING);
  }, [timeLeft, appState]);

  // 4. 收获逻辑：更新数据库
  const handleCollect = async () => {
    const newCount = voxelCount + 1;
    setVoxelCount(newCount);
    setAppState(AppState.STABLE);
    
    // 如果用户已登录，保存到数据库
    if (user) {
      await supabase
        .from('profiles')
        .update({ orange_count: newCount, updated_at: new Date() })
        .eq('id', user.id);
    }

    if (engineRef.current) {
      if (currentModelData) {
        engineRef.current.rebuild(currentModelData);
      } else {
        engineRef.current.loadInitialModel(Generators.OrangeHarvest(newCount, String(newCount)), newCount);
      }
    }
  };

  // 其余处理函数...
  const handleDismantle = () => engineRef.current?.dismantle();
  const handleStartTimer = () => { setAppState(AppState.TIMING); setTimeLeft(FOCUS_DURATION); setIsTimerPaused(false); };
  const handleQuitTimer = () => setAppState(AppState.STABLE);
  const handleTogglePauseTimer = () => setIsTimerPaused(!isTimerPaused);
  const handleOrangeRebuild = () => { setCurrentModelData(null); engineRef.current?.rebuild(Generators.OrangeHarvest(voxelCount, String(voxelCount))); };
  const handleShowJson = () => { if (engineRef.current) { setJsonData(engineRef.current.getJsonData()); setJsonModalMode('view'); setIsJsonModalOpen(true); } };
  const handleImportClick = () => { setJsonModalMode('import'); setIsJsonModalOpen(true); };
  const handleJsonImport = (jsonStr: string) => {
      try {
          const rawData = JSON.parse(jsonStr);
          const importedData: VoxelData[] = rawData.map((v: any) => ({ x: Number(v.x) || 0, y: Number(v.y) || 0, z: Number(v.z) || 0, color: 0xFF8C00 }));
          setCurrentModelData(importedData);
          engineRef.current?.rebuild(importedData);
      } catch (e) { alert(language === 'zh' ? "导入失败" : "Import failed"); }
  };
  const handleToggleRotation = () => { const nextState = !isAutoRotate; setIsAutoRotate(nextState); engineRef.current?.setAutoRotate(nextState); }
  const handlePromptSubmit = async (prompt: string) => {
    setIsGenerating(true);
    setIsPromptModalOpen(false);
    try {
        const response = await fetch('/.netlify/functions/voxel-gen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, voxelCount, language })
        });
        const data = await response.json();
        if (Array.isArray(data)) {
            const voxelData: VoxelData[] = data.map((v: any) => ({ x: v.x, y: v.y, z: v.z, color: 0xFF8C00 }));
            setCurrentModelData(voxelData);
            engineRef.current?.rebuild(voxelData);
        }
    } catch (err) { alert(language === 'zh' ? "生成失败" : "Generation failed"); } finally { setIsGenerating(false); }
  };

  const isTimingOrCollecting = appState === AppState.TIMING || appState === AppState.COLLECTING;
  const progress = appState === AppState.COLLECTING ? 1 : (FOCUS_DURATION - timeLeft) / FOCUS_DURATION;

  return (
    <div className="relative w-full h-screen bg-[#f8f6ef] overflow-hidden transition-colors duration-1000">
      <div ref={containerRef} className={`absolute inset-0 z-0 transition-all duration-1000 ${isTimingOrCollecting ? 'opacity-0 scale-150 blur-[100px]' : 'opacity-100 scale-100'}`} />
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 bg-gradient-to-br from-[#fdfcf7] via-[#f7eee1] to-[#f5e3cc] ${isTimingOrCollecting ? 'opacity-100' : 'opacity-0'}`} />

      {isTimingOrCollecting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
           <div className="pointer-events-auto mt-[-80px]">
             <LiquidOrangeTimer progress={progress} isPaused={isTimerPaused || appState === AppState.COLLECTING} />
           </div>
        </div>
      )}

      <UIOverlay 
        voxelCount={voxelCount} appState={appState} language={language} onLanguageChange={setLanguage}
        currentBaseModel={currentModelData ? (language === 'zh' ? "AI 雕塑" : "AI Sculpture") : (language === 'zh' ? "原始橘子" : "Original Oranges")}
        isAutoRotate={isAutoRotate} isInfoVisible={showWelcome} isGenerating={isGenerating} timeLeft={timeLeft} isTimerPaused={isTimerPaused}
        onDismantle={handleDismantle} onOrangeRebuild={handleOrangeRebuild}
        onPromptCreate={() => { setPromptMode('create'); setIsPromptModalOpen(true); }}
        onShowJson={handleShowJson} onImportJson={handleImportClick} onToggleRotation={handleToggleRotation}
        onToggleInfo={() => setShowWelcome(!showWelcome)} onStartTimer={handleStartTimer} onQuitTimer={handleQuitTimer}
        onCollect={handleCollect} onTogglePauseTimer={handleTogglePauseTimer}
        user={user} onAuthClick={() => user ? supabase.auth.signOut() : setIsAuthModalOpen(true)}
      />

      <WelcomeScreen visible={showWelcome} language={language} onClose={() => setShowWelcome(false)} />
      <JsonModal language={language} isOpen={isJsonModalOpen} onClose={() => setIsJsonModalOpen(false)} data={jsonData} isImport={jsonModalMode === 'import'} onImport={handleJsonImport} />
      <PromptModal language={language} isOpen={isPromptModalOpen} mode={promptMode} onClose={() => setIsPromptModalOpen(false)} onSubmit={handlePromptSubmit} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} language={language} />
    </div>
  );
};

export default App;
