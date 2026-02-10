
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface LiquidOrangeTimerProps {
  progress: number; // 0 to 1
  isPaused: boolean;
}

export const LiquidOrangeTimer: React.FC<LiquidOrangeTimerProps> = ({ progress, isPaused }) => {
  // progress determines the y position of the liquid
  const liquidY = 100 - (progress * 100);

  return (
    <div className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center animate-in zoom-in fade-in duration-700">
      {/* Outer Glow & Shadow */}
      <div className="absolute inset-0 rounded-full bg-orange-100/20 blur-3xl" />
      
      {/* Glass Sphere Container */}
      <div className="relative w-full h-full rounded-full border border-white/40 shadow-[inset_0_0_80px_rgba(255,255,255,0.4),0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden bg-white/10 backdrop-blur-[2px]">
        
        {/* Animated Liquid */}
        <div 
          className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out"
          style={{ height: `${progress * 100}%` }}
        >
          <svg 
            viewBox="0 0 100 20" 
            preserveAspectRatio="none" 
            className="absolute -top-[15px] left-0 w-[200%] h-[20px]"
            style={{ 
              animation: isPaused ? 'none' : 'wave 3s linear infinite',
              fill: '#fb923c' // orange-400
            }}
          >
            <path d="M0 10 Q 25 20 50 10 T 100 10 T 150 10 T 200 10 V 20 H 0 Z" />
          </svg>
          <div className="w-full h-full bg-orange-400" />
        </div>

        {/* Secondary Inner Shadow for Depth */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_-20px_40px_rgba(251,146,60,0.3)]" />

        {/* Glossy Highlights */}
        {/* Top Left Main Highlight */}
        <div className="absolute top-[10%] left-[15%] w-[40%] h-[25%] bg-gradient-to-br from-white/60 to-transparent rounded-full blur-[4px] rotate-[-25deg]" />
        
        {/* Bottom Right Rim Light */}
        <div className="absolute bottom-[5%] right-[10%] w-[30%] h-[15%] border-b-4 border-r-4 border-white/20 rounded-full blur-[2px]" />
      </div>

      {/* Stem/Leaf (Stylized) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-2 h-8 bg-amber-900/60 rounded-full" />
        <div className="absolute top-0 -left-6 w-10 h-6 bg-emerald-500/80 rounded-full rotate-[-20deg] blur-[1px] shadow-sm border border-emerald-400/30" />
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
