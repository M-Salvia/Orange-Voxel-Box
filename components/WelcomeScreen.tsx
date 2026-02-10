
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
  visible: boolean;
  language: 'zh' | 'en';
  onClose?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ visible, language, onClose }) => {
  const isZh = language === 'zh';

  return (
    <div className={`
        absolute top-24 left-0 w-full pointer-events-none flex justify-center z-20 select-none
        transition-all duration-500 ease-out transform font-sans
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}
    `}>
      <div className="text-center flex flex-col items-center gap-6 bg-white/95 backdrop-blur-md p-8 rounded-[44px] border-4 border-orange-100 shadow-2xl max-w-xl mx-4 pointer-events-auto">
        
        <div className="flex justify-between w-full items-start">
            <div className="text-left">
                <h1 className="text-4xl font-black text-slate-800 uppercase tracking-widest mb-1">
                    {isZh ? '橘子收集箱' : 'Orange Voxel Box'}
                </h1>
                <div className="text-sm font-black text-orange-500 uppercase tracking-[0.4em]">
                    {isZh ? '一份耕耘，无限可能' : 'One focus, infinite possibilities'}
                </div>
            </div>
            {onClose && (
                <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                </button>
            )}
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-full">
            <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold bg-white shadow-sm text-orange-600">
                <BookOpen size={18} /> {isZh ? '玩法说明' : 'How to Play'}
            </div>
        </div>
        
        <div className="w-full">
            <div className="space-y-6 text-left w-full animate-in fade-in duration-300">
                <div className="flex flex-col gap-1 border-l-4 border-orange-400 pl-4">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                        {isZh ? '第一步：通过专注积累' : 'STEP 1: ACCUMULATE BY FOCUSING'}
                    </span>
                    <p className="text-base font-bold text-slate-700 leading-snug">
                        {isZh 
                            ? '点击“专注收获”按钮。每完成一次 45 分钟的专注，你就会获得一个新的橘子。这是你唯一的建筑材料。' 
                            : 'Click "Focus Harvest". Complete a 45-minute focus session to earn one new orange. These are your only building blocks.'}
                    </p>
                </div>
                <div className="flex flex-col gap-1 border-l-4 border-indigo-400 pl-4">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                        {isZh ? '第二步：让 Gemini 赋予生命' : 'STEP 2: LET GEMINI GIVE LIFE'}
                    </span>
                    <p className="text-base font-bold text-slate-700 leading-snug">
                        {isZh 
                            ? '调用 Gemini AI 将你的橘子雕刻成任何形状。如果你的橘子太少而请求太复杂，它会为你建立一个原型版本。' 
                            : 'Ask Gemini AI to carve your oranges into any shape. If you have too few oranges for a complex request, it will create a prototype version.'}
                    </p>
                </div>
                <div className="flex flex-col gap-1 border-l-4 border-emerald-400 pl-4">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        {isZh ? '第三步：持续生长' : 'STEP 3: CONTINUOUS GROWTH'}
                    </span>
                    <p className="text-base font-bold text-slate-700 leading-snug">
                        {isZh 
                            ? '新收获的橘子会立即加入当前的雕塑。随着果园壮大，随时可以把你的作品重塑为更宏伟的形态。' 
                            : 'Newly harvested oranges join your current sculpture instantly. As your harvest grows, reshape your work into grander forms.'}
                    </p>
                </div>
            </div>
        </div>

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 border-t border-slate-100 pt-6 w-full">
            {isZh ? '准备好开始了吗？点击“说明”或右上角 X 关闭此窗口。' : 'READY TO START? CLICK "INFO" OR X TO CLOSE THIS WINDOW.'}
        </div>
      </div>
    </div>
  );
};
