export function pmt(rate: number, nper: number, pv: number) {
  if (nper <= 0) return pv;
  if (!rate || rate === 0) return pv / nper;
  return (pv * rate) / (1 - Math.pow(1 + rate, -nper));
}
