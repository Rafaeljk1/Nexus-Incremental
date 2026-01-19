
import React from 'react';
import { formatNumber } from '../utils/formatters';

interface StatsPanelProps {
  credits: number;
  cps: number;
  clickPower: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ credits, cps, clickPower }) => {
  return (
    <div className="flex flex-col items-center mb-12 space-y-2">
      <div className="text-sm font-medium tracking-widest uppercase text-white/40">Current Balance</div>
      <div className="text-6xl md:text-8xl font-black font-heading tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
        {formatNumber(credits)}
      </div>
      <div className="flex space-x-6 pt-4">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Passive Income</span>
          <span className="text-lg font-semibold text-indigo-400">+{formatNumber(cps)}<span className="text-xs opacity-60 ml-1">/s</span></span>
        </div>
        <div className="w-px h-8 bg-white/10 self-end"></div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Click Efficiency</span>
          <span className="text-lg font-semibold text-violet-400">+{formatNumber(clickPower)}<span className="text-xs opacity-60 ml-1">/tap</span></span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
