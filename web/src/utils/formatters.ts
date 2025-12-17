export const formatCurrency = (amount: number, currency: string = 'PLN'): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const getRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return formatDate(d);
};

export const getWalletTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    PERSONAL: 'Personal',
    FAMILY: 'Family',
    BUSINESS: 'Business',
    SAVINGS: 'Savings',
    CASH: 'Cash',
  };
  return labels[type] || type;
};

export const getWalletTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    PERSONAL: '#2563eb',
    FAMILY: '#7c3aed',
    BUSINESS: '#059669',
    SAVINGS: '#d97706',
    CASH: '#64748b',
  };
  return colors[type] || '#64748b';
};

export const getLiabilityTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    LOAN: 'Loan',
    CREDIT_CARD: 'Credit Card',
    MORTGAGE: 'Mortgage',
    PERSONAL_DEBT: 'Personal Debt',
  };
  return labels[type] || type;
};
