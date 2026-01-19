
import React from 'react';
import { Upgrade } from '../types';
import { formatNumber, calculatePrice } from '../utils/formatters';
import { PRICE_SCALING } from '../constants';

interface UpgradeItemProps {
  upgrade: Upgrade;
  quantity: number;
  currentBalance: number;
  onPurchase: (id: string) => void;
}

const UpgradeItem: React.FC<UpgradeItemProps> = ({ upgrade, quantity, currentBalance, onPurchase }) => {
  const price = calculatePrice(upgrade.basePrice, quantity, PRICE_SCALING);
  const canAfford = currentBalance >= price;

  return (
    <button
      disabled={!canAfford}
      onClick={() => onPurchase(upgrade.id)}
      className={`w-full group text-left p-4 rounded-2xl glass transition-all duration-300 flex items-center space-x-4
        ${canAfford ? 'glass-hover cursor-pointer' : 'opacity-40 grayscale cursor-not-allowed'}
      `}
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-2xl group-hover:scale-110 transition-transform`}>
        {upgrade.icon}
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-white/90">{upgrade.name}</h4>
          <span className="text-xs font-medium text-white/40">Lv. {quantity}</span>
        </div>
        <p className="text-xs text-white/40 line-clamp-1 mb-1">{upgrade.description}</p>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-bold ${canAfford ? 'text-indigo-400' : 'text-white/20'}`}>
            {formatNumber(price)}
          </span>
          <span className="text-[10px] uppercase text-white/20">Credits</span>
        </div>
      </div>
      
      <div className={`text-xs font-bold px-2 py-1 rounded bg-white/5 ${upgrade.type === 'click' ? 'text-violet-400' : 'text-indigo-400'}`}>
        +{formatNumber(upgrade.baseValue)}
      </div>
    </button>
  );
};

export default UpgradeItem;
