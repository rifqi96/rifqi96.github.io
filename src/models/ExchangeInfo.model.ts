export type RateLimit = {
  rateLimitType: string;
  interval: string;
  intervalNum: number;
  limit: number;
};

export type Asset = {
  asset: string;
  marginAvailable: boolean;
  autoAssetExchange: string;
};

export type Symbol = {
  symbol: string;
  pair: string;
  contractType: string;
  deliveryDate: number;
  onboardDate: number;
  status: string;
  maintMarginPercent: string;
  requiredMarginPercent: string;
  baseAsset: string;
  quoteAsset: string;
  marginAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  baseAssetPrecision: number;
  quotePrecision: number;
  underlyingType: string;
  underlyingSubType: string[];
  settlePlan: number;
  triggerProtect: string;
  liquidationFee: string;
  marketTakeBound: string;
  maxMoveOrderLimit: number;
  filters: {
    maxPrice: string;
    minPrice: string;
    tickSize: string;
    filterType: string;
  }[];
  orderTypes: string[];
  timeInForce: string[];
};

export type ExchangeInfo = {
  timezone: string;
  serverTime: number;
  futuresType: string;
  rateLimits: RateLimit[];
  exchangeFilters: string[];
  assets: Asset[];
  symbols: Symbol[];
};
