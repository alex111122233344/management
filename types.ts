
export enum AssetType {
  US_STOCK = 'US_STOCK',
  TW_STOCK = 'TW_STOCK',
  CASH = 'CASH',
  OTHER = 'OTHER'
}

export enum Currency {
  USD = 'USD',
  TWD = 'TWD',
  JPY = 'JPY'
}

export interface Asset {
  id: string;
  type: AssetType;
  symbol: string;
  name: string;
  shares: number;
  price: number;
  currency: Currency;
  updatedAt: number;
}

export interface ExchangeRate {
  usdToTwd: number;
  jpyToTwd: number;
  lastUpdate: number;
}

export interface AppState {
  assets: Asset[];
  rates: ExchangeRate;
}
