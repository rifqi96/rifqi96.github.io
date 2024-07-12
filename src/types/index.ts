export interface Trade {
  datetime: string;
  pair: string;
  leverage: number;
  position: string;
  stopLossPercent: number;
  stopLossDollar: number;
  slPrice: number | null;
  rr: number;
  text: string;
  reduceText: string;
  beText: string;
  slText: string;
}
