
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, FloatingTextData } from './types';
import { UPGRADES, SAVE_KEY, PRICE_SCALING } from './constants';
import { calculatePrice } from './utils/formatters';
import StatsPanel from './components/StatsPanel';
import UpgradeItem from './components/UpgradeItem';
import FloatingText from './components/FloatingText';

const INITIAL_STATE: GameState = {
  credits: 0,
  totalCreditsEarned: 0,
  clickCount: 0,
  upgrades: {},
  lastSaved: Date.now(),
};

const App: React.FC = () => {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const stateRef = useRef(state);

  // Sync ref with state for the game loop to avoid stale closures
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load game state
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic migration/validation
        const loadedState = { ...INITIAL_STATE, ...parsed };
        
        // Idle progress calculation
        const now = Date.now();
        const secondsPassed = Math.floor((now - loadedState.lastSaved) / 1000);
        
        if (secondsPassed > 0) {
          const idleIncome = calculatePassiveIncome(loadedState) * secondsPassed;
          loadedState.credits += idleIncome;
          loadedState.totalCreditsEarned += idleIncome;
        }
        
        setState(loadedState);
      } catch (e) {
        console.error("Failed to load save data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save game state
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        ...stateRef.current,
        lastSaved: Date.now()
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoaded]);

  // Game Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const cps = calculatePassiveIncome(stateRef.current);
      if (cps > 0) {
        setState(prev => ({
          ...prev,
          credits: prev.credits + (cps / 10),
          totalCreditsEarned: prev.totalCreditsEarned + (cps / 10)
        }));
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const calculatePassiveIncome = (gs: GameState) => {
    return UPGRADES.reduce((acc, up) => {
      if (up.type === 'passive') {
        const count = gs.upgrades[up.id] || 0;
        return acc + (count * up.baseValue);
      }
      return acc;
    }, 0);
  };

  const calculateClickPower = (gs: GameState) => {
    const bonus = UPGRADES.reduce((acc, up) => {
      if (up.type === 'click') {
        const count = gs.upgrades[up.id] || 0;
        return acc + (count * up.baseValue);
      }
      return acc;
    }, 0);
    return 1 + bonus;
  };

  const handleManualClick = (e: React.MouseEvent | React.TouchEvent) => {
    const clickPower = calculateClickPower(state);
    
    // Position for floating text
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const newText: FloatingTextData = {
      id: Date.now(),
      x: clientX,
      y: clientY,
      value: clickPower.toFixed(0)
    };

    setFloatingTexts(prev => [...prev.slice(-20), newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 800);

    setState(prev => ({
      ...prev,
      credits: prev.credits + clickPower,
      totalCreditsEarned: prev.totalCreditsEarned + clickPower,
      clickCount: prev.clickCount + 1
    }));
  };

  const handlePurchase = (upgradeId: string) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId)!;
    const count = state.upgrades[upgradeId] || 0;
    const price = calculatePrice(upgrade.basePrice, count, PRICE_SCALING);

    if (state.credits >= price) {
      setState(prev => ({
        ...prev,
        credits: prev.credits - price,
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: count + 1
        }
      }));
    }
  };

  const activeCPS = calculatePassiveIncome(state);
  const activeClickPower = calculateClickPower(state);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Floating UI Elements */}
      {floatingTexts.map(t => (
        <FloatingText key={t.id} data={t} />
      ))}

      <header className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center glass border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white">N</div>
          <span className="font-heading font-extrabold text-xl tracking-tighter">NEXUS</span>
        </div>
        <div className="flex space-x-4 text-[10px] uppercase tracking-widest text-white/40">
          <div className="hidden md:block">Session: <span className="text-white/80">Active</span></div>
          <div>Efficiency: <span className="text-white/80">98.4%</span></div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-32 pb-12 flex flex-col lg:flex-row gap-12 min-h-screen">
        
        {/* Left Side: Clicker Area */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 py-12">
          <StatsPanel 
            credits={state.credits} 
            cps={activeCPS} 
            clickPower={activeClickPower} 
          />

          {/* Main Interaction Core */}
          <div className="relative group">
            {/* Pulsing Back Glow */}
            <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full group-hover:bg-indigo-500/30 transition-all duration-500 animate-pulse"></div>
            
            <button
              onMouseDown={handleManualClick}
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full glass glow flex items-center justify-center
                active:scale-95 transition-transform duration-75 outline-none ring-offset-4 ring-offset-black ring-indigo-500/20 ring-0 hover:ring-2"
            >
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-b from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-all">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-indigo-500/20 border border-white/5 flex items-center justify-center animate-spin-slow">
                   <div className="w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-white/30 text-xs font-heading tracking-[0.3em] uppercase group-hover:text-white/60 transition-colors">Engage Core</span>
              </div>
            </button>
          </div>

          <p className="text-white/20 text-xs text-center max-w-xs uppercase tracking-widest leading-loose">
            Tap the Nexus core to generate credits. Upgrades will automate the process.
          </p>
        </div>

        {/* Right Side: Upgrades Panel */}
        <div className="w-full lg:w-[450px] flex flex-col space-y-4">
          <div className="sticky top-28 space-y-6">
            <div className="flex justify-between items-end px-2">
              <h3 className="font-heading font-bold text-2xl">Upgrades</h3>
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Growth Phase 01</span>
            </div>
            
            <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar pb-12">
              {UPGRADES.map(upgrade => (
                <UpgradeItem
                  key={upgrade.id}
                  upgrade={upgrade}
                  quantity={state.upgrades[upgrade.id] || 0}
                  currentBalance={state.credits}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 text-center text-[10px] uppercase tracking-widest text-white/20">
        &copy; 2024 Nexus Operations Group. Authorized personnel only.
      </footer>
    </div>
  );
};

export default App;
