import React from 'react';
import { formatNumber } from '../utils/formatters';

interface StatsPanelProps {
  credits: number;
  cps: number;
  clickPower: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ credits, cps, clickPower }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm font-medium tracking-widest uppercase text-white/40">Current Balance</div>
      <div 
        className="text-8xl font-black font-heading tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
        style={{ textAlign: 'center' }}
      >
        {formatNumber(credits)}
      </div>
      <div className="flex space-x-6" style={{ paddingTop: '1rem' }}>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-white/30" style={{ marginBottom: '0.25rem' }}>Passive Income</span>
          <span className="text-lg font-semibold text-indigo-400">
            +{formatNumber(cps)}<span className="text-xs" style={{ opacity: 0.6, marginLeft: '0.25rem' }}>/s</span>
          </span>
        </div>
        <div style={{ width: '1px', height: '2rem', background: 'rgba(255,255,255,0.1)', alignSelf: 'flex-end' }}></div>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-white/30" style={{ marginBottom: '0.25rem' }}>Click Efficiency</span>
          <span className="text-lg font-semibold text-violet-400">
            +{formatNumber(clickPower)}<span className="text-xs" style={{ opacity: 0.6, marginLeft: '0.25rem' }}>/tap</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;