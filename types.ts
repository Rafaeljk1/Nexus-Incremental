
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  baseValue: number;
  type: 'click' | 'passive';
  icon: string;
}

export interface GameState {
  credits: number;
  totalCreditsEarned: number;
  clickCount: number;
  upgrades: Record<string, number>; // upgradeId: quantity
  lastSaved: number;
}

export interface FloatingTextData {
  id: number;
  x: number;
  y: number;
  value: string;
}
