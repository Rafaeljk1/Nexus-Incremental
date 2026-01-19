
import React from 'react';
import { FloatingTextData } from '../types';

interface FloatingTextProps {
  data: FloatingTextData;
}

const FloatingText: React.FC<FloatingTextProps> = ({ data }) => {
  return (
    <div
      className="fixed pointer-events-none select-none font-bold text-2xl text-white z-50 animate-float"
      style={{ left: data.x, top: data.y }}
    >
      +{data.value}
    </div>
  );
};

export default FloatingText;
