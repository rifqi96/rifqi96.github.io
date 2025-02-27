export interface Trade {
  datetime: string;
  pair: string;
  leverage: number;
  price: number;
  position: string;
  positionCmd: string;
  positionReduce: string;
  positionH: string;
  tpsl: string;
  rr: number;
  slot: string;
  apiSecret: string;
  text: string;
  reduceText: string;
  beText: string;
  orders: string[][];
  mode: string;
  stopLossDollar: number;
  stopLossPercent: number;
  slPrice: number | null;
  openPrice: number | null;
  tpPrice: number | null;
  smPrice: number | null;
  reduceAmount: number;
}

export interface SymbolData {
  symbol: string;
  filters: {
    filterType: string;
    minQty?: number;
    maxQty?: number;
  }[];
}
