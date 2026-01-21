type ApiMode = 'mock' | 'api' | 'hybrid';

type DataSource = 'mock' | 'api';

const normalizeMode = (value: string | undefined): ApiMode => {
  if (value === 'api' || value === 'hybrid' || value === 'mock') {
    return value;
  }
  return 'mock';
};

const apiMode = normalizeMode(import.meta.env.VITE_API_MODE);

const requireSource = (value: string | undefined, label: string): DataSource => {
  if (value === 'api' || value === 'mock') {
    return value;
  }
  throw new Error(`${label} must be set to "api" or "mock".`);
};

export const apiConfig = {
  mode: apiMode,
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  authSource: requireSource(import.meta.env.VITE_AUTH_SOURCE, 'VITE_AUTH_SOURCE'),
  walletsSource: requireSource(import.meta.env.VITE_WALLETS_SOURCE, 'VITE_WALLETS_SOURCE'),
  transactionsSource: requireSource(import.meta.env.VITE_TRANSACTIONS_SOURCE, 'VITE_TRANSACTIONS_SOURCE'),
};

export const isAuthApiEnabled = apiConfig.authSource === 'api';
export const isWalletsApiEnabled = apiConfig.walletsSource === 'api';
export const isTransactionsApiEnabled = apiConfig.transactionsSource === 'api';
