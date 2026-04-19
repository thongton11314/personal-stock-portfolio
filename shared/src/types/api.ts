export interface ApiError {
  error: string;
  details?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

export interface RefreshResult {
  refreshed: number;
  failed: number;
  rateLimited: boolean;
  lastRefresh: string;
}

export interface PublicPortfolioResponse {
  portfolio: {
    title: string;
    subtitle: string;
    description: string;
    disclaimer: string;
    lastUpdated: string;
  };
  summary: {
    totalValue: number;
    totalReturn: number;
    holdingsCount: number;
  };
  holdings: Array<{
    ticker: string;
    companyName: string;
    sector: string;
    weight: number;
    marketValue: number;
    gainLoss: number;
    gainLossPercent: number;
    notes: string;
  }>;
  allocation: {
    bySector: Array<{ sector: string; weight: number }>;
  };
}
