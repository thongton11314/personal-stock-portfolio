export interface PortfolioSettings {
  title: string;
  subtitle: string;
  description: string;
  disclaimer: string;
}

export interface BenchmarkSettings {
  symbol: string;
  name: string;
}

export interface PublicPageSettings {
  isPublished: boolean;
  slug: string;
  seoTitle: string;
  seoDescription: string;
}

export interface AuthSettings {
  username: string;
  passwordHash: string;
}

export interface Settings {
  portfolio: PortfolioSettings;
  benchmark: BenchmarkSettings;
  publicPage: PublicPageSettings;
  auth: AuthSettings;
  updatedAt: string;
}
