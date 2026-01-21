type ApiMode = 'mock' | 'api' | 'hybrid';

type DataSource = 'mock' | 'api';

const normalizeMode = (value: string | undefined): ApiMode => {
  if (value === 'api' || value === 'hybrid' || value === 'mock') {
    return value;
  }
  return 'mock';
};

const normalizeSource = (value: string | undefined): DataSource | null => {
  if (value === 'api' || value === 'mock') {
    return value;
  }
  return null;
};

const apiMode = normalizeMode(import.meta.env.VITE_API_MODE);

const defaultMatrix: Record<ApiMode, { auth: DataSource; wallets: DataSource; transactions: DataSource }> = {
  mock: { auth: 'mock', wallets: 'mock', transactions: 'mock' },
  api: { auth: 'api', wallets: 'api', transactions: 'api' },
  hybrid: { auth: 'api', wallets: 'mock', transactions: 'mock' },
};

const walletsOverride = normalizeSource(import.meta.env.VITE_WALLETS_SOURCE);
const transactionsOverride = normalizeSource(import.meta.env.VITE_TRANSACTIONS_SOURCE);

const modeDefaults = defaultMatrix[apiMode];

export const apiConfig = {
  mode: apiMode,
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  authSource: modeDefaults.auth,
  walletsSource: walletsOverride ?? modeDefaults.wallets,
  transactionsSource: transactionsOverride ?? modeDefaults.transactions,
};

export const isAuthApiEnabled = apiConfig.authSource === 'api';
export const isWalletsApiEnabled = apiConfig.walletsSource === 'api';
export const isTransactionsApiEnabled = apiConfig.transactionsSource === 'api';
