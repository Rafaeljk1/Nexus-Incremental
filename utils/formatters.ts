
export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toFixed(1).replace(/\.0$/, '');
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q', 'Qi', 'Sx', 'Sp'];
  const suffixNum = Math.floor(("" + num.toFixed(0)).length / 3);
  let shortValue = parseFloat((suffixNum !== 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(3));
  
  if (shortValue % 1 !== 0) {
    shortValue = parseFloat(shortValue.toFixed(2));
  }
  return shortValue + suffixes[suffixNum];
};

export const calculatePrice = (basePrice: number, count: number, scaling: number): number => {
  return Math.floor(basePrice * Math.pow(scaling, count));
};
