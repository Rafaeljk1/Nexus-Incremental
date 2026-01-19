import React, { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const loadedState = { ...INITIAL_STATE, ...parsed };
        const now = Date.now();
        const secondsPassed = Math.floor((now - (loadedState.lastSaved || now)) / 1000);
        
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

  const handleManualClick = (e: React.MouseEvent | React.TouchEvent) => {
    const clickPower = calculateClickPower(state);
    const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as any).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const newText: FloatingTextData = {
      id: Date.now() + Math.random(),
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

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Initializing Multiclick...
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div className="fixed inset-0" style={{ pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(99, 102, 241, 0.1)', filter: 'blur(120px)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(120px)', borderRadius: '50%' }}></div>
      </div>

      {floatingTexts.map(t => (
        <FloatingText key={t.id} data={t} />
      ))}

      <header className="fixed z-40 glass" style={{ top: 0, left: 0, right: 0, padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center" style={{ gap: '0.5rem' }}>
          <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>M</div>
          <span className="font-heading" style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.05em' }}>MULTICLICK</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4 }}>
          <span>Session: <strong style={{ color: '#fff' }}>Active</strong></span>
          <span>Efficiency: <strong style={{ color: '#fff' }}>98.4%</strong></span>
        </div>
      </header>

      <main className="container flex flex-col lg:flex-row" style={{ paddingTop: '8rem', paddingBottom: '3rem', gap: '3rem', minHeight: '100vh' }}>
        <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: '3rem', padding: '3rem 0' }}>
          <StatsPanel 
            credits={state.credits} 
            cps={activeCPS} 
            clickPower={activeClickPower} 
          />

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(99, 102, 241, 0.2)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
            <button
              onMouseDown={handleManualClick}
              style={{
                position: 'relative', width: '20rem', height: '20rem', borderRadius: '50%',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.1s'
              }}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseDownCapture={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
            >
              <div style={{ width: '16rem', height: '16rem', borderRadius: '50%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-spin-slow" style={{ width: '10rem', height: '10rem', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)' }}></div>
              </div>
              <div style={{ position: 'absolute', opacity: 0.3, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Engage Core</div>
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textAlign: 'center', maxWidth: '300px', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 2 }}>
            Tap the Multiclick core to generate credits. Upgrades will automate the process.
          </p>
        </div>

        <div style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'sticky', top: '7rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 0.5rem' }}>
              <h3 className="font-heading" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Upgrades</h3>
              <span style={{ fontSize: '10px', opacity: 0.3, textTransform: 'uppercase' }}>Growth Phase 01</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', paddingRight: '0.5rem' }}>
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

      <footer style={{ padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.2 }}>
        &copy; 2024 Multiclick Operations Group. Authorized personnel only.
      </footer>
    </div>
  );
};

export default App;