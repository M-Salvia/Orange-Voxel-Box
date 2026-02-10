
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { Box, Code2, Wand2, Hammer, FolderOpen, ChevronUp, Play, Pause, Info, Loader2, Sparkles, Citrus, X as CloseIcon, Timer, CheckCircle2, Languages, User, LogOut } from 'lucide-react';

interface UIOverlayProps {
  voxelCount: number;
  appState: AppState;
  language: 'zh' | 'en';
  onLanguageChange: (lang: 'zh' | 'en') => void;
  currentBaseModel: string;
  isAutoRotate: boolean;
  isInfoVisible: boolean;
  isGenerating: boolean;
  timeLeft?: number;
  onDismantle: () => void;
  onOrangeRebuild: () => void;
  onPromptCreate: () => void;
  onShowJson: () => void;
  onImportJson: () => void;
  onToggleRotation: () => void;
  onToggleInfo: () => void;
  onStartTimer?: () => void;
  onQuitTimer?: () => void;
  onCollect?: () => void;
  onTogglePauseTimer?: () => void;
  isTimerPaused?: boolean;
  user?: any;
  onAuthClick?: () => void;
}

const T = {
    zh: {
        buildScheme: "构建方案",
        reset: "重置为橘子",
        aiCreator: "Gemini AI 创造者",
        importJson: "导入 JSON 蓝图",
        harvest: "收获成果",
        info: "说明",
        rotate: "旋转",
        export: "导出",
        thinking: "正在思考...",
        calculating: "正在计算 3D 坐标分布",
        dismantle: "破坏",
        focus: "专注收获",
        restore: "还原",
        continue: "继续",
        pause: "暂停",
        quit: "退出",
        collect: "领取",
        skip: "跳过",
        login: "登录保存",
        logout: "退出登录",
        hello: "你好，"
    },
    en: {
        buildScheme: "Build Schemes",
        reset: "Reset to Oranges",
        aiCreator: "Gemini AI Creator",
        importJson: "Import JSON Blueprint",
        harvest: "Total Harvest",
        info: "Info",
        rotate: "Rotate",
        export: "Export",
        thinking: "Thinking...",
        calculating: "Distributing 3D Coordinates",
        dismantle: "Dismantle",
        focus: "Focus Harvest",
        restore: "Restore",
        continue: "Resume",
        pause: "Pause",
        quit: "Quit",
        collect: "Collect",
        skip: "Skip",
        login: "Login to Sync",
        logout: "Logout",
        hello: "Hi, "
    }
};

export const UIOverlay: React.FC<UIOverlayProps> = ({
  voxelCount, appState, language, onLanguageChange, currentBaseModel, isAutoRotate, isInfoVisible, isGenerating, timeLeft = 0,
  onDismantle, onOrangeRebuild, onPromptCreate, onShowJson, onImportJson, onToggleRotation, onToggleInfo,
  onStartTimer, onQuitTimer, onCollect, onTogglePauseTimer, isTimerPaused, user, onAuthClick
}) => {
  const isStable = appState === AppState.STABLE;
  const isTiming = appState === AppState.TIMING;
  const isCollecting = appState === AppState.COLLECTING;
  const isDismantling = appState === AppState.DISMANTLING;
  
  const dict = T[language];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || '';

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none font-sans">
      
      {!(isTiming || isCollecting) && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start animate-in fade-in duration-500">
          <div className="pointer-events-auto flex flex-col gap-2">
              <DropdownMenu icon={<FolderOpen size={20} />} label={dict.buildScheme} color="indigo">
                  <DropdownItem onClick={onOrangeRebuild} icon={<Citrus size={16}/>} label={dict.reset} highlight />
                  <div className="h-px bg-slate-100 my-1" />
                  <DropdownItem onClick={onPromptCreate} icon={<Wand2 size={16}/>} label={dict.aiCreator} />
                  <DropdownItem onClick={onImportJson} icon={<Box size={16}/>} label={dict.importJson} />
              </DropdownMenu>

              <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-sm shadow-sm rounded-xl border border-slate-200 text-slate-500 font-bold w-fit mt-2">
                  <div className={`bg-orange-100 text-orange-600 p-1.5 rounded-lg`}>
                      <Citrus size={16} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col leading-none">
                      <span className="text-[10px] uppercase tracking-wider opacity-60">{dict.harvest}</span>
                      <span className="text-lg text-slate-800 font-extrabold font-mono">{voxelCount}</span>
                  </div>
              </div>
          </div>

          <div className="pointer-events-auto flex gap-2 items-start">
              <div className="flex flex-col items-end gap-1.5">
                  {user && (
                    <div className="px-3 py-1 bg-orange-50 rounded-lg border border-orange-100 text-[10px] font-black text-orange-500 uppercase tracking-widest shadow-sm animate-in slide-in-from-top-1">
                       {dict.hello}{displayName}
                    </div>
                  )}
                  <button 
                    onClick={onAuthClick}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border-b-[4px] active:border-b-0 active:translate-y-[4px] shadow-lg ${user ? 'bg-white text-slate-600 border-slate-200' : 'bg-orange-500 text-white border-orange-700'}`}
                  >
                    {user ? <LogOut size={18}/> : <User size={18}/>}
                    <span>{user ? dict.logout : dict.login}</span>
                  </button>
              </div>

              <TactileButton 
                onClick={() => onLanguageChange(language === 'zh' ? 'en' : 'zh')} 
                color="slate" icon={<Languages size={18} strokeWidth={2.5} />} label={language === 'zh' ? 'EN' : 'ZH'} compact 
              />
              <TactileButton onClick={onToggleInfo} color={isInfoVisible ? 'indigo' : 'slate'} icon={<Info size={18} strokeWidth={2.5} />} label={dict.info} compact />
              <TactileButton onClick={onToggleRotation} color={isAutoRotate ? 'sky' : 'slate'} icon={isAutoRotate ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />} label={dict.rotate} compact />
              <TactileButton onClick={onShowJson} color="slate" icon={<Code2 size={18} strokeWidth={2.5} />} label={dict.export} />
          </div>
        </div>
      )}

      {isGenerating && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="bg-white/95 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                  <Loader2 size={48} className="text-indigo-500 animate-spin" />
                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight text-center">{dict.thinking}<br/><span className="text-xs text-slate-400 font-medium">{dict.calculating}</span></h3>
              </div>
          </div>
      )}

      {isTiming && (
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none animate-in fade-in duration-1000">
           <span className="text-7xl sm:text-8xl font-black text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.1)] font-mono tracking-tighter">
              {formatTime(timeLeft)}
           </span>
        </div>
      )}

      <div className="absolute bottom-12 left-0 w-full flex justify-center items-end pointer-events-none">
        <div className="pointer-events-auto">
            {isStable && (
                 <div className="animate-in slide-in-from-bottom-10 fade-in duration-300 flex gap-16 items-center">
                     <BigActionButton onClick={onDismantle} icon={<Hammer size={32} strokeWidth={2.5} />} label={dict.dismantle} color="rose" />
                     <div className="animate-in slide-in-from-right-4 duration-500">
                        <BigActionButton onClick={onStartTimer} icon={<Timer size={32} strokeWidth={2.5} />} label={dict.focus} color="emerald" />
                     </div>
                 </div>
            )}

            {isDismantling && !isGenerating && (
                <div className="animate-in slide-in-from-bottom-10 fade-in duration-300 flex gap-16 items-center">
                    <BigActionButton onClick={onOrangeRebuild} icon={<Sparkles size={32} strokeWidth={2.5} />} label={dict.restore} color="emerald" />
                </div>
            )}

            {isTiming && (
              <div className="flex items-center justify-center gap-16 animate-in slide-in-from-bottom-6 duration-500">
                  <BigActionButton onClick={onTogglePauseTimer} color="emerald" icon={isTimerPaused ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />} label={isTimerPaused ? dict.continue : dict.pause} />
                  <BigActionButton onClick={onQuitTimer} color="rose" icon={<CloseIcon size={32} strokeWidth={3} />} label={dict.quit} />
              </div>
            )}

            {isCollecting && (
              <div className="flex items-center justify-center gap-16 animate-in slide-in-from-bottom-6 duration-700">
                  <BigActionButton onClick={onCollect} color="emerald" icon={<CheckCircle2 size={32} strokeWidth={3} />} label={dict.collect} />
                  <BigActionButton onClick={onQuitTimer} color="rose" icon={<CloseIcon size={32} strokeWidth={3} />} label={dict.skip} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Sub-components as defined previously...
const BigActionButton: React.FC<{onClick: () => void, icon: React.ReactNode, label: string, color: 'rose' | 'emerald'}> = ({ onClick, icon, label, color }) => {
    const bgColor = color === 'rose' ? 'bg-[#ff4d6d] hover:bg-[#ff1a44] border-[#c9183b] shadow-[0_12px_24px_-5px_rgba(255,77,109,0.3)]' : 'bg-[#10b981] hover:bg-[#059669] border-[#047857] shadow-[0_12px_24px_-5px_rgba(16,185,129,0.3)]';
    return <button onClick={onClick} className={`group relative flex flex-col items-center justify-center w-32 h-32 rounded-[36px] ${bgColor} text-white border-b-[8px] active:border-b-0 active:translate-y-[8px] transition-all duration-150 pointer-events-auto`} ><div className="mb-2 shrink-0 group-hover:scale-110 transition-transform">{icon}</div><div className="text-[10px] font-black tracking-[0.2em] uppercase">{label}</div></button>
}
interface TactileButtonProps { onClick: () => void; disabled?: boolean; icon: React.ReactNode; label: string; color: 'slate' | 'rose' | 'sky' | 'emerald' | 'amber' | 'indigo'; compact?: boolean; }
const TactileButton: React.FC<TactileButtonProps> = ({ onClick, disabled, icon, label, color, compact }) => {
  const colorStyles = { slate: 'bg-slate-200 text-slate-600 border-slate-400 hover:bg-slate-300', rose: 'bg-rose-500 text-white border-rose-700 hover:bg-rose-600', sky: 'bg-sky-500 text-white border-sky-700 hover:bg-sky-600', emerald: 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-600', amber: 'bg-amber-400 text-amber-900 border-amber-600 hover:bg-amber-500', indigo: 'bg-indigo-500 text-white border-indigo-700 hover:bg-indigo-600' };
  return <button onClick={onClick} disabled={disabled} className={`group relative flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all duration-100 border-b-[4px] active:border-b-0 active:translate-y-[4px] ${compact ? 'p-2.5' : 'px-4 py-3'} ${disabled ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed shadow-none' : `${colorStyles[color]} shadow-lg`} `} > {icon} {!compact && <span>{label}</span>} </button>;
};
interface DropdownProps { icon: React.ReactNode; label: string; children: React.ReactNode; color: 'indigo' | 'emerald'; direction?: 'up' | 'down'; big?: boolean; }
const DropdownMenu: React.FC<DropdownProps> = ({ icon, label, children, color, direction = 'down', big }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const bgClass = color === 'indigo' ? 'bg-indigo-500 hover:bg-indigo-600 border-indigo-800' : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-800';
    return <div className="relative" ref={menuRef}><button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 font-bold text-white shadow-lg rounded-2xl transition-all active:scale-95 ${bgClass} ${big ? 'px-8 py-4 text-lg border-b-[6px] active:border-b-0 active:translate-y-[6px]' : 'px-4 py-3 text-sm border-b-[4px] active:border-b-0 active:translate-y-[4px]'} `} > {icon} {label} <ChevronUp size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${direction === 'down' ? 'rotate-180' : ''}`} /> </button>{isOpen && <div className={`absolute left-0 ${direction === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} w-56 max-h-[60vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-2 border-slate-100 p-2 flex flex-col gap-1 animate-in fade-in zoom-in duration-200 z-50`}>{children}</div>}</div>
}
const DropdownItem: React.FC<{ onClick: () => void, icon: React.ReactNode, label: string, highlight?: boolean, truncate?: boolean }> = ({ onClick, icon, label, highlight, truncate }) => {
    return <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors text-left ${highlight ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'text-slate-600 hover:bg-slate-100'} `} ><div className="shrink-0">{icon}</div><span className={truncate ? "truncate w-full" : ""}>{label}</span></button>
}
