export type HoldingStatus = 'active' | 'archived';
export type AssetType = 'Stock' | 'ETF' | 'Mutual Fund' | 'Bond' | 'Other';

export interface Holding {
  id: string;
  ticker: string;
  companyName: string;
  assetType: AssetType;
  quantity: number;
  averageCost: number;
  purchaseDate: string;
  sector: string;
  notes: string;
  isPublic: boolean;
  displayOrder: number;
  status: HoldingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicHolding {
  ticker: string;
  companyName: string;
  sector: string;
  weight: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  notes: string;
}

export interface CreateHoldingRequest {
  ticker: string;
  companyName: string;
  assetType: AssetType;
  quantity: number;
  averageCost: number;
  purchaseDate: string;
  sector?: string;
  notes?: string;
  isPublic?: boolean;
  displayOrder?: number;
}

export interface UpdateHoldingRequest {
  companyName?: string;
  assetType?: AssetType;
  quantity?: number;
  averageCost?: number;
  purchaseDate?: string;
  sector?: string;
  notes?: string;
  isPublic?: boolean;
  displayOrder?: number;
  status?: HoldingStatus;
}

export type TransactionType = 'buy' | 'sell';

export interface Transaction {
  id: string;
  ticker: string;
  type: TransactionType;
  quantity: number;
  price: number;
  date: string;
  totalCost: number;
  notes: string;
  createdAt: string;
}
